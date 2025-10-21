import { LinearClient as LinearSDK } from '@linear/sdk';
import { ConfigurationError } from '../lib/errors';

export class LinearClient {
  private client: LinearSDK;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.LINEAR_API_KEY;

    if (!key) {
      throw new ConfigurationError('LINEAR_API_KEY is required');
    }

    this.client = new LinearSDK({ apiKey: key });
  }

  getClient(): LinearSDK {
    return this.client;
  }
}
