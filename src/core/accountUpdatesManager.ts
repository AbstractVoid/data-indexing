import { AccountUpdate } from "./types";
import { getAccountUpdateKey } from "./helpers";

export default class AccountUpdatesManager {
    private updatesProcessing: Map<string, Promise<boolean>> = new Map();
    private accountUpdates: Map<string, AccountUpdate>;

    constructor() {
        this.accountUpdates = new Map();
    }

    ingestUpdate(accountUpdate: AccountUpdate): void {
        const updateKey = getAccountUpdateKey(accountUpdate.id, accountUpdate.parentProgramSubType);
        const processing = this.updatesProcessing.get(updateKey) || Promise.resolve(false);
        this.updatesProcessing.set(updateKey, processing.then(() => this.processUpdate(accountUpdate)));
    }

    async processUpdate(accountUpdate: AccountUpdate): Promise<boolean> {
        const updateKey = this.addAccountUpdate(accountUpdate);

        if (updateKey) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this.accountUpdates.get(updateKey)!.version === accountUpdate.version) {
                        console.log('\nAccount update callback:', accountUpdate);
                        resolve(true);
                    }
                    resolve(false);
                }, accountUpdate.callbackTimeMs);
            });
        }

        return false;
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