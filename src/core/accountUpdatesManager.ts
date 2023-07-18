import { EventEmitter } from 'events';

import { AccountUpdate } from "./types";
import { getAccountUpdateKey } from "./helpers";

export default class AccountUpdatesManager extends EventEmitter {   
    public updatesProcessing: Map<string, Promise<void>> = new Map();
    private accountUpdates: Map<string, AccountUpdate>;

    constructor() {
        super();
        this.accountUpdates = new Map();
    }

    ingestUpdate(accountUpdate: AccountUpdate): Promise<void> {
        const updateKey = getAccountUpdateKey(accountUpdate.id, accountUpdate.parentProgramSubType);
        const processing = this.updatesProcessing.get(updateKey) || Promise.resolve(false);
        const newProcessing = processing.then(() => this.processUpdate(accountUpdate));
        this.updatesProcessing.set(updateKey, newProcessing);
        return newProcessing
    }

    processUpdate(accountUpdate: AccountUpdate): void {
        if (accountUpdate.version === undefined) {
            console.warn("Account update added without version info:", accountUpdate);
        }

        const updateKey = this.addAccountUpdate(accountUpdate);

        if (updateKey) {
            setTimeout(() => {
                let callbackSuccessful = false;
                if (this.accountUpdates.get(updateKey)!.version === accountUpdate.version) {
                    console.log('\nAccount update callback:', accountUpdate);
                    callbackSuccessful = true;
                }
                console.log("Emitted event");
                this.emit("callbackResult", accountUpdate, callbackSuccessful);
            }, accountUpdate.callbackTimeMs);
        }
    }

    addAccountUpdate(accountUpdate: AccountUpdate): string | undefined {
        const updateKey = getAccountUpdateKey(accountUpdate.id, accountUpdate.parentProgramSubType);
        if (this.accountUpdates.has(updateKey) && this.accountUpdates.get(updateKey)!.version >= accountUpdate.version) {
            console.log('Ignored old account update');
            return undefined;
        }

        this.accountUpdates.set(updateKey, accountUpdate);
        return updateKey;
    }

    getHighestTokenAccountUpdates(): Map<string, AccountUpdate[]> {
        const accountUpdates = Array.from(this.accountUpdates.values());
        const uniqueSubTypes = Array.from(new Set(accountUpdates.map(update => update.parentProgramSubType)));
        
        const highestTokenAccountUpdates: Map<string, AccountUpdate[]> = new Map();
        uniqueSubTypes.forEach(subType => {
            const sortedUpdates = accountUpdates
                .filter(update => update.parentProgramSubType === subType)
                .sort((a: AccountUpdate, b: AccountUpdate) => b.tokens - a.tokens);
            
            highestTokenAccountUpdates.set(subType, sortedUpdates);
        });

        return highestTokenAccountUpdates;
    }

    getAccountUpdate(updateKey: string): AccountUpdate | undefined {
        return this.accountUpdates.has(updateKey) ? this.accountUpdates.get(updateKey) : undefined;
    }
}