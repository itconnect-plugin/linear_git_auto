import { logger } from './logger';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isRetriable(error: any): boolean {
  // Check if error explicitly marks itself as non-retriable
  if (error.retriable === false) {
    return false;
  }

  // Rate limit errors are retriable
  if (error.message?.includes('rate limit')) {
    return true;
  }

  // Network errors are retriable
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Default: retriable
  return true;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts;
      const shouldRetry = isRetriable(error);

      if (!shouldRetry || isLastAttempt) {
        logger.error(
          { error, attempts: attempt, maxAttempts },
          'Operation failed after retries'
        );
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(
        { attempt, maxAttempts, delay, error: (error as Error).message },
        'Retry attempt'
      );

      await sleep(delay);
    }
  }

  // TypeScript exhaustiveness check
  throw new Error('Unreachable code');
}
