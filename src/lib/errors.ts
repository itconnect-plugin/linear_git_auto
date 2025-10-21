export class LinearSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LinearSyncError';
    Object.setPrototypeOf(this, LinearSyncError.prototype);
  }
}

export class ConfigurationError extends LinearSyncError {
  public readonly retriable = false;

  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class ValidationError extends LinearSyncError {
  public readonly retriable = false;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class APIError extends LinearSyncError {
  public readonly statusCode: number;
  public readonly retriable: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;

    // Retriable status codes: 429 (rate limit), 500-599 (server errors)
    this.retriable = statusCode === 429 || (statusCode >= 500 && statusCode < 600);

    Object.setPrototypeOf(this, APIError.prototype);
  }
}
