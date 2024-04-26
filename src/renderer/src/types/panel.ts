export enum PositionType {
    CTR = "CTR",
    APP = "APP",
    TWR = "TWR",
    MIL = "MIL",
}

export interface Item {
    id?: number;
    label: string;
    stationType?: PositionType
}

export interface MenuProps {
    items: Item[];
    clickable: boolean;
    setStationType: (position: PositionType) => void
}

export interface Positions {
    CTR: Station[];
    APP: Station[];
    TWR: Station[];
    MIL: Station[];
}

export interface Station {
    label: string;
    frequency: string;
    callsign: string;
    color: string;
}

export interface ButtonProps {
    position: Station;
}