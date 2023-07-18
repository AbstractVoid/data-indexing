import { AccountUpdate } from "./types";

export function getAccountUpdateKey(accountUpdate: AccountUpdate): string {
    return `${accountUpdate.id}:${accountUpdate.parentProgramSubType}`;
}