import fs from 'fs';
import { promisify } from 'util';

import { AccountUpdate } from './core/types';
import AccountUpdatesManager from './core/accountUpdatesManager';

const readFile = promisify(fs.readFile);

async function readJsonFile(filepath: string): Promise<AccountUpdate[]> {
    const data = await readFile(filepath, 'utf8');
    return JSON.parse(data);
}

async function mockAccountProcessing() {
    const accountUpdates: AccountUpdate[] = await readJsonFile('accounts.json');
    const accountUpdatesManager = new AccountUpdatesManager();

    accountUpdates.forEach((update) => {
        setTimeout(() => {
            accountUpdatesManager.ingestUpdate(update);
        }, Math.random() * 1000);
    });
}

mockAccountProcessing();