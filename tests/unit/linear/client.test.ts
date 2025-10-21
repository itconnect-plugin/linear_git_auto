import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinearClient } from '../../../src/linear/client';

// Mock @linear/sdk
vi.mock('@linear/sdk', () => {
  return {
    LinearClient: vi.fn().mockImplementation(() => {
      return {
        issueCreate: vi.fn(),
        issue: vi.fn(),
        team: vi.fn(),
      };
    }),
  };
});

describe('Linear API Client', () => {
  let client: LinearClient;

  beforeEach(() => {
    process.env.LINEAR_API_KEY = 'test-api-key';
    client = new LinearClient();
  });

  it('should create Linear client with API key', () => {
    expect(client).toBeDefined();
  });

  it('should throw error if API key is missing', () => {
    delete process.env.LINEAR_API_KEY;
    expect(() => new LinearClient()).toThrow('LINEAR_API_KEY is required');
  });
});
