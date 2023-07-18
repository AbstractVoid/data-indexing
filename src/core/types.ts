
export interface AccountUpdate {
    id: string;
    parentProgram: string;
    parentProgramSubType: string;
    tokens: number;
    data: any;
    callbackTimeMs: number;
    version: number;
}