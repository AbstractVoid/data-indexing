import fs from 'fs';
import { promisify } from 'util';

import { AccountUpdate } from './core/types';
import AccountUpdatesManager from './core/accountUpdatesManager';

const readFile = promisify(fs.readFile);

async function readJsonFile(filepath: string): Promise<AccountUpdate[]> {
    const data = await readFile(filepath, 'utf8');
    return JSON.parse(data);
}

async function processAccounts(accountUpdatesManager: AccountUpdatesManager) {
    const accountUpdates: AccountUpdate[] = await readJsonFile('accounts.json');

    const promises = accountUpdates.map((update) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                accountUpdatesManager.ingestUpdate(update);
                resolve();
            }, Math.random() * 1000);
        });
    });

    await Promise.all(promises);
}

function main() {
    const accountUpdatesManager = new AccountUpdatesManager();

    processAccounts(accountUpdatesManager).then(() => {
        console.log("\n\n========== HIGHEST TOKEN ACCOUNT UPDATES ==========\n");
        console.log(accountUpdatesManager.getHighestTokenAccountUpdates());
        console.log("\n========== END HIGHEST TOKEN ACCOUNT UPDATES ==========\n\n");
    })
}

main();