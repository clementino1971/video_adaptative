export interface iEvent {
    set(key: string, records: [number]): void;
    get(key: string): [number] | undefined;
    dump(): Object;
}
export declare class Event implements iEvent {
    private logs;
    constructor();
    set(key: string, records: [number]): void;
    get(key: string): [number] | undefined;
    push(key: string, value: number): void;
    dump(): Object;
}
