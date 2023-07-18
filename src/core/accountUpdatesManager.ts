import { AccountUpdate } from "./types";
import { getAccountUpdateKey } from "./helpers";

export default class AccountUpdatesManager {
    private updatesProcessing: Map<string, Promise<void>> = new Map();
    private accountUpdates: Map<string, AccountUpdate>;

    constructor() {
        this.accountUpdates = new Map();
    }

    ingestUpdate(accountUpdate: AccountUpdate): void {
        const updateKey = getAccountUpdateKey(accountUpdate.id, accountUpdate.parentProgramSubType);
        const processing = this.updatesProcessing.get(updateKey) || Promise.resolve(false);
        const newProcessing = processing.then(() => this.processUpdate(accountUpdate));
        this.updatesProcessing.set(updateKey, newProcessing);
    }

    processUpdate(accountUpdate: AccountUpdate): void {
        // if (accountUpdate.version === undefined) {
        //     console.warn("Account update added without version info:", accountUpdate);
        // }

        const updateKey = this.addAccountUpdate(accountUpdate);

        if (updateKey) {
            setTimeout(() => {
                if (this.accountUpdates.get(updateKey)!.version === accountUpdate.version) {
                    console.log('\nAccount update callback:', accountUpdate);
                }
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