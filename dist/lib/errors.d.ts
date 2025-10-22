export declare class LinearSyncError extends Error {
    constructor(message: string);
}
export declare class ConfigurationError extends LinearSyncError {
    readonly retriable = false;
    constructor(message: string);
}
export declare class ValidationError extends LinearSyncError {
    readonly retriable = false;
    constructor(message: string);
}
export declare class APIError extends LinearSyncError {
    readonly statusCode: number;
    readonly retriable: boolean;
    constructor(message: string, statusCode: number);
}
//# sourceMappingURL=errors.d.ts.map