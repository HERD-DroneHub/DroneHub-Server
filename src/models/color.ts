const BLUE = "0288D1";
const ORANGE = "FF8D00";
const GREEN = "66BB6A";
const RED = "E53935";
const PURPLE = "BA68C8";
const CYAN = "80DEEA";
const SUMP = "5EFC82";
const PINK = "ec407a";
const YELLOW = "fbc02d";

let availableColors = [ YELLOW, PINK, SUMP, CYAN, PURPLE, RED, GREEN, ORANGE, BLUE ];

let colors = new Map<string, string|any>();

export function acquireColor(id:string) {
    colors.set(id, availableColors.pop());
    return getColor(id);
}

export function releaseColor(id:string|any) {
    availableColors.push(getColor(id));
    colors.delete(id);
}

export function getColor(id:string) {
    return colors.get(id);
}
