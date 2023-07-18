import { AccountUpdate } from './types';
import AccountUpdatesManager from './accountUpdatesManager';
import { getAccountUpdateKey, getRandomInt } from './helpers';

describe('AccountUpdatesManager', () => {
  let accountUpdatesManager: AccountUpdatesManager;
  let accountUpdateData: AccountUpdate;
  let accountUpdateDataKey: string;

  beforeEach(() => {
    jest.useFakeTimers();
    accountUpdatesManager = new AccountUpdatesManager();
    accountUpdateData = {
      id: "hhpGbCqzxJDCCHEDFXXD3b8XUbTRUygDpc36qQZdy7pL",
      parentProgram: "auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8",
      parentProgramSubType: "auctionData",
      tokens: 520,
      callbackTimeMs: 1000,
      data: {
        expiry: -1,
        currentBid: 682
      },
      version: 12
    };
    accountUpdateDataKey = getAccountUpdateKey(accountUpdateData.id, accountUpdateData.parentProgramSubType);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function validateCallbackResults(expectedResults: Map<AccountUpdate, boolean>) {
    accountUpdatesManager.on("callbackResult", (accountUpdate: AccountUpdate, callbackResult: boolean) => {
      expect(callbackResult).toEqual(expectedResults.get(accountUpdate));
    });
  }

  test('addAccountUpdate should add account', () => {
    const key = accountUpdatesManager.addAccountUpdate(accountUpdateData);
    expect(key).toBe(accountUpdateDataKey);

    const storedAccount = accountUpdatesManager.getAccountUpdate(key!);
    expect(storedAccount).toBe(accountUpdateData);
  });

  test('ingestUpdate should update if version is higher', async () => {
    const newUpdateData = { ...accountUpdateData, tokens: accountUpdateData.tokens + getRandomInt(500), version: accountUpdateData.version + getRandomInt(10) };
    
    const callbackResultsMap = new Map();
    callbackResultsMap.set(accountUpdateData, false);
    callbackResultsMap.set(newUpdateData, true);
    validateCallbackResults(callbackResultsMap);

    const promises = [accountUpdateData, newUpdateData].map(update => {
      return accountUpdatesManager.ingestUpdate(update);
    });
    await Promise.all(promises);
    jest.runAllTimers();
    
    const accountUpdate = accountUpdatesManager.getAccountUpdate(accountUpdateDataKey);
    expect(accountUpdate).toBe(newUpdateData);
  });

  test('ingestUpdate should NOT update if version is lower for an existing matching update', async () => {
    const newUpdateData = { ...accountUpdateData, tokens: 0, version: 0 };
    
    const callbackResultsMap = new Map();
    callbackResultsMap.set(accountUpdateData, true);
    validateCallbackResults(callbackResultsMap);

    const promises = [accountUpdateData, newUpdateData].map(update => {
      return accountUpdatesManager.ingestUpdate(update);
    });
    await Promise.all(promises);
    jest.runAllTimers();
    
    const accountUpdate = accountUpdatesManager.getAccountUpdate(accountUpdateDataKey);
    expect(accountUpdate).toBe(accountUpdateData);
  });
});