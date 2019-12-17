export interface iLogger {
    debug(primaryMessage: string, ...supportingData: any[]): void;
    warn(primaryMessage: string, ...supportingData: any[]): void;
    error(primaryMessage: string, ...supportingData: any[]): void;
    info(primaryMessage: string, ...supportingData: any[]): void;
}
export declare class Logger implements iLogger {
    private sessionId;
    private userId;
    constructor(userId: string, sessionId: string);
    debug(primaryMessage: string, ...supportingData: any[]): void;
    warn(primaryMessage: string, ...supportingData: any[]): void;
    error(primaryMessage: string, ...supportingData: any[]): void;
    info(primaryMessage: string, ...supportingData: any[]): void;
    private emitLogMessage;
    getLogs(): void;
}
