import { EventEmitter } from 'events';

import { AccountUpdate } from './types';
import { CALLBACK_EVENT_NAME } from './constants';
import { getAccountUpdateKey } from './helpers';

export default class AccountUpdatesManager extends EventEmitter {   
    private updatesProcessing: Map<string, Promise<void>> = new Map();
    private accountUpdates: Map<string, AccountUpdate> = new Map();
    private callbacks: Map<string, any> = new Map();

    ingestUpdate(accountUpdate: AccountUpdate): Promise<void> {
        const updateKey = getAccountUpdateKey(accountUpdate.id, accountUpdate.parentProgramSubType);
        const processing = this.updatesProcessing.get(updateKey) || Promise.resolve(false);
        const newProcessing = processing.then(() => this.processUpdate(accountUpdate));
        this.updatesProcessing.set(updateKey, newProcessing);
        return newProcessing;
    }

    processUpdate(accountUpdate: AccountUpdate): void {
        const updateKey = this.addAccountUpdate(accountUpdate);

        if (updateKey) {
            const callback = setTimeout(() => {
                console.log("\nAccount update callback:", accountUpdate);
                this.emit(CALLBACK_EVENT_NAME);
            }, accountUpdate.callbackTimeMs);
            
            this.callbacks.set(updateKey, callback);
        }
    }

    addAccountUpdate(accountUpdate: AccountUpdate): string | undefined {
        const updateKey = getAccountUpdateKey(accountUpdate.id, accountUpdate.parentProgramSubType);

        if (this.accountUpdates.has(updateKey) && this.accountUpdates.get(updateKey)!.version >= accountUpdate.version) {
            console.log(`\nIgnored old account update: ${updateKey}:${accountUpdate.version}`);
            return undefined;
        }

        this.accountUpdates.set(updateKey, accountUpdate);
        console.log(`\nIndexed update: ${updateKey}:${accountUpdate.version}`);
        
        if (this.callbacks.has(updateKey)) {
            clearTimeout(this.callbacks.get(updateKey));
            this.callbacks.delete(updateKey);
            console.log(`\nCanceled old callback: ${updateKey}:${accountUpdate.version}`);
        }

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