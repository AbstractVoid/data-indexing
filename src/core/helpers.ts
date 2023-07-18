
export function getAccountUpdateKey(id: string, parentProgramSubType: string): string {
    return `${id}:${parentProgramSubType}`;
}

export function getRandomInt(max: number) {
    return Math.ceil(Math.random() * max);
}