import AccountUpdatesManager from './accountUpdatesManager';
import { getAccountUpdateKey, getRandomInt } from './helpers';
import { AccountUpdate } from './types';
import { CALLBACK_EVENT_NAME } from './constants';

describe('AccountUpdatesManager', () => {
  let accountUpdatesManager: AccountUpdatesManager;
  let mockCallbackFn: jest.Mock;
  let accountUpdateData: AccountUpdate;
  let accountUpdateDataKey: string;

  beforeEach(() => {
    jest.useFakeTimers();
    accountUpdatesManager = new AccountUpdatesManager();
    mockCallbackFn = jest.fn();
    accountUpdatesManager.on(CALLBACK_EVENT_NAME, mockCallbackFn);
  
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

  test('addAccountUpdate should add account', () => {
    const key = accountUpdatesManager.addAccountUpdate(accountUpdateData);
    expect(key).toBe(accountUpdateDataKey);

    const storedAccount = accountUpdatesManager.getAccountUpdate(key!);
    expect(storedAccount).toBe(accountUpdateData);
  });

  test('ingestUpdate should update if version is higher', async () => {
    const newUpdateData = { ...accountUpdateData, tokens: accountUpdateData.tokens + getRandomInt(500), version: accountUpdateData.version + getRandomInt(10) };

    const promises = [accountUpdateData, newUpdateData].map(update => {
      return accountUpdatesManager.ingestUpdate(update);
    });
    await Promise.all(promises);
    jest.runAllTimers();
    
    const accountUpdate = accountUpdatesManager.getAccountUpdate(accountUpdateDataKey);

    expect(mockCallbackFn).toHaveBeenCalledTimes(1);
    expect(accountUpdate).toBe(newUpdateData);
  });

  test('ingestUpdate should NOT update if version is lower for an existing matching update', async () => {
    const newUpdateData = { ...accountUpdateData, tokens: 0, version: 0 };

    const promises = [accountUpdateData, newUpdateData].map(update => {
      return accountUpdatesManager.ingestUpdate(update);
    });
    await Promise.all(promises);
    jest.runAllTimers();
    
    const accountUpdate = accountUpdatesManager.getAccountUpdate(accountUpdateDataKey);

    expect(mockCallbackFn).toHaveBeenCalledTimes(1);
    expect(accountUpdate).toBe(accountUpdateData);
  });

  test('Ingesting lots of matching updates but only one callback should be called', async () => {
    const accountUpdates = Array.from(Array(10).keys()).map(versionInc => {
      const callbackMs = Math.random() * 2000 + 1000;
      return {
        ...accountUpdateData,
        callbackTimeMs: callbackMs,
        version: accountUpdateData.version + versionInc
      };
    });

    const promises = accountUpdates.map(update => {
      return accountUpdatesManager.ingestUpdate(update);
    });
    await Promise.all(promises);
    jest.runAllTimers();

    expect(mockCallbackFn).toHaveBeenCalledTimes(1);
  });
});