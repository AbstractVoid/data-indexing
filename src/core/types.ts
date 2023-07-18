
export interface AccountUpdate {
    id: string;
    parentProgramId: string;
    parentProgramSubType: string;
    tokens: number;
    data: any;
    callbackTimeMs: number;
    version: number;
}