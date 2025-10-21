import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../../src/lib/retry';

describe('Retry Logic', () => {
  it('should execute operation successfully on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await withRetry(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry up to 3 times on failure', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await withRetry(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should throw error after 3 failed attempts', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('persistent failure'));

    await expect(withRetry(operation)).rejects.toThrow('persistent failure');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff (1s, 2s, 4s)', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const start = Date.now();
    await withRetry(operation);
    const duration = Date.now() - start;

    // Should have delays: ~1000ms + ~2000ms = ~3000ms
    // Allow some tolerance for execution time
    expect(duration).toBeGreaterThanOrEqual(2900);
  });

  it('should not retry on non-retriable errors', async () => {
    const nonRetriableError = new Error('Authentication failed');
    (nonRetriableError as any).retriable = false;

    const operation = vi.fn().mockRejectedValue(nonRetriableError);

    await expect(withRetry(operation)).rejects.toThrow('Authentication failed');
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
