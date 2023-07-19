
export function getAccountUpdateKey(id: string, parentProgramSubType: string): string {
    return `${id}:${parentProgramSubType}`;
}

export function getRandomInt(max: number) {
    return Math.ceil(Math.random() * max);
}

export function generateRandomString(length: number): string {
    return Array.from({length}, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('');
}