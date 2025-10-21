import { describe, it, expect } from 'vitest';
import {
  LinearSyncError,
  ConfigurationError,
  ValidationError,
  APIError,
} from '../../../src/lib/errors';

describe('Error Classes', () => {
  describe('LinearSyncError', () => {
    it('should create base error with message', () => {
      const error = new LinearSyncError('Base error');
      expect(error.message).toBe('Base error');
      expect(error.name).toBe('LinearSyncError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Missing API key');
      expect(error.message).toBe('Missing API key');
      expect(error.name).toBe('ConfigurationError');
      expect(error).toBeInstanceOf(LinearSyncError);
    });

    it('should not be retriable', () => {
      const error = new ConfigurationError('Config issue');
      expect((error as any).retriable).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid branch name');
      expect(error.message).toBe('Invalid branch name');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(LinearSyncError);
    });

    it('should not be retriable', () => {
      const error = new ValidationError('Validation failed');
      expect((error as any).retriable).toBe(false);
    });
  });

  describe('APIError', () => {
    it('should create API error with status code', () => {
      const error = new APIError('Rate limited', 429);
      expect(error.message).toBe('Rate limited');
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('APIError');
      expect(error).toBeInstanceOf(LinearSyncError);
    });

    it('should be retriable for 429 status', () => {
      const error = new APIError('Rate limited', 429);
      expect((error as any).retriable).toBe(true);
    });

    it('should be retriable for 500 status', () => {
      const error = new APIError('Server error', 500);
      expect((error as any).retriable).toBe(true);
    });

    it('should not be retriable for 400 status', () => {
      const error = new APIError('Bad request', 400);
      expect((error as any).retriable).toBe(false);
    });

    it('should not be retriable for 401 status', () => {
      const error = new APIError('Unauthorized', 401);
      expect((error as any).retriable).toBe(false);
    });
  });
});
