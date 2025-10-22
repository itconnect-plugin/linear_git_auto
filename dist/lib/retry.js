"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
const logger_1 = require("./logger");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function isRetriable(error) {
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
async function withRetry(operation, maxAttempts = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            const isLastAttempt = attempt === maxAttempts;
            const shouldRetry = isRetriable(error);
            if (!shouldRetry || isLastAttempt) {
                logger_1.logger.error({ error, attempts: attempt, maxAttempts }, 'Operation failed after retries');
                throw error;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            logger_1.logger.warn({ attempt, maxAttempts, delay, error: error.message }, 'Retry attempt');
            await sleep(delay);
        }
    }
    // TypeScript exhaustiveness check
    throw new Error('Unreachable code');
}
//# sourceMappingURL=retry.js.map