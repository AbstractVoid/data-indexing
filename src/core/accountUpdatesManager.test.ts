import { AccountUpdate } from './types';
import AccountUpdatesManager from './accountUpdatesManager';
import { getAccountUpdateKey, getRandomInt } from './helpers';

describe('AccountUpdatesManager', () => {
  let accountUpdatesManager: AccountUpdatesManager;
  let auctionDataUpdate: AccountUpdate;
  let auctionDataUpdateKey: string;
  let metadataUpdate: AccountUpdate;

  beforeEach(() => {

    accountUpdatesManager = new AccountUpdatesManager();
    auctionDataUpdate = {
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
    auctionDataUpdateKey = getAccountUpdateKey(auctionDataUpdate.id, auctionDataUpdate.parentProgramSubType);
    metadataUpdate = {
      id: "foXSdE2dWiip5Tw42QY94hcKSZRLZAaUmuSpYqsjANN8",
      parentProgram: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      parentProgramSubType: "metadata",
      tokens: 538,
      callbackTimeMs: 1000,
      data: {
        img: "https://arweave.net/CMh6W4zwS3xUYSNed2bx4rsCDUzxMPFYM6qE69oDkwT3"
      },
      version: 39
    };
  });

  test('addAccountUpdate should add account', () => {
    const key = accountUpdatesManager.addAccountUpdate(auctionDataUpdate);
    expect(key).toBe(auctionDataUpdateKey);

    const storedAccount = accountUpdatesManager.getAccountUpdate(key!);
    expect(storedAccount).toBe(auctionDataUpdate);
  });

  test('processUpdate should update if version is higher', async () => {
    const firstUpdate = accountUpdatesManager.processUpdate(auctionDataUpdate);
    
    const newUpdateData = { ...auctionDataUpdate, tokens: auctionDataUpdate.tokens + getRandomInt(500), version: auctionDataUpdate.version + getRandomInt(10) };
    const secondUpdate = accountUpdatesManager.processUpdate(newUpdateData);
    
    const firstUpdateResult = await firstUpdate;
    const secondUpdateResult = await secondUpdate;
    const accountUpdate = accountUpdatesManager.getAccountUpdate(auctionDataUpdateKey);
    
    expect(firstUpdateResult).toBe(false);
    expect(secondUpdateResult).toBe(true);
    expect(accountUpdate).toBe(newUpdateData);
  });

  test('processUpdate should NOT update if version is lower for an existing matching update', async () => {
    const firstUpdate = accountUpdatesManager.processUpdate(auctionDataUpdate);
    
    const newUpdateData = { ...auctionDataUpdate, tokens: 0, version: 0 };
    const secondUpdate = accountUpdatesManager.processUpdate(newUpdateData);
    
    const firstUpdateResult = await firstUpdate;
    const secondUpdateResult = await secondUpdate;
    const accountUpdate = accountUpdatesManager.getAccountUpdate(auctionDataUpdateKey);
    
    expect(firstUpdateResult).toBe(true);
    expect(secondUpdateResult).toBe(false);
    expect(accountUpdate).toBe(auctionDataUpdate);
  });

  // TODO: add more tests
});