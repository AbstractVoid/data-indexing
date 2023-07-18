import { AccountUpdate } from "./types";
import { getAccountUpdateKey } from "./helpers";

export default class AccountUpdatesManager {
    private updatesProcessing: Map<string, Promise<void>> = new Map();
    private accountUpdates: Map<string, AccountUpdate>;

    constructor() {
        this.accountUpdates = new Map();
    }

    ingestUpdate(accountUpdate: AccountUpdate): void {
        const processing = this.updatesProcessing.get(getAccountUpdateKey(accountUpdate)) || Promise.resolve();
        this.updatesProcessing.set(getAccountUpdateKey(accountUpdate), processing.then(() => this.processUpdate(accountUpdate)));
    }

    processUpdate(accountUpdate: AccountUpdate): void {
        const updateKey = getAccountUpdateKey(accountUpdate);
        if (this.accountUpdates.has(updateKey) && this.accountUpdates.get(updateKey)!.version >= accountUpdate.version) {
            console.log('Ignored old account update');
            return;
        }

        this.accountUpdates.set(updateKey, accountUpdate);

        setTimeout(() => {
            if (this.accountUpdates.get(updateKey)!.version === accountUpdate.version) {
                console.log('\nAccount update callback:', accountUpdate);
            }
        }, accountUpdate.callbackTimeMs);
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
}