"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = exports.ValidationError = exports.ConfigurationError = exports.LinearSyncError = void 0;
class LinearSyncError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LinearSyncError';
        Object.setPrototypeOf(this, LinearSyncError.prototype);
    }
}
exports.LinearSyncError = LinearSyncError;
class ConfigurationError extends LinearSyncError {
    retriable = false;
    constructor(message) {
        super(message);
        this.name = 'ConfigurationError';
        Object.setPrototypeOf(this, ConfigurationError.prototype);
    }
}
exports.ConfigurationError = ConfigurationError;
class ValidationError extends LinearSyncError {
    retriable = false;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class APIError extends LinearSyncError {
    statusCode;
    retriable;
    constructor(message, statusCode) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        // Retriable status codes: 429 (rate limit), 500-599 (server errors)
        this.retriable = statusCode === 429 || (statusCode >= 500 && statusCode < 600);
        Object.setPrototypeOf(this, APIError.prototype);
    }
}
exports.APIError = APIError;
//# sourceMappingURL=errors.js.map