import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, Config } from '../../../src/config/index';

describe('Config Management', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load LINEAR_API_KEY from environment', () => {
    process.env.LINEAR_API_KEY = 'test-api-key';
    process.env.LINEAR_TEAM_ID = 'test-team-id'; // Both required
    const config = getConfig();
    expect(config.linearApiKey).toBe('test-api-key');
  });

  it('should load LINEAR_TEAM_ID from environment', () => {
    process.env.LINEAR_API_KEY = 'test-api-key'; // Both required
    process.env.LINEAR_TEAM_ID = 'test-team-id';
    const config = getConfig();
    expect(config.linearTeamId).toBe('test-team-id');
  });

  it('should throw error when LINEAR_API_KEY is missing', () => {
    delete process.env.LINEAR_API_KEY;
    expect(() => getConfig()).toThrow('LINEAR_API_KEY is required');
  });

  it('should throw error when LINEAR_TEAM_ID is missing', () => {
    process.env.LINEAR_API_KEY = 'test-key';
    delete process.env.LINEAR_TEAM_ID;
    expect(() => getConfig()).toThrow('LINEAR_TEAM_ID is required');
  });

  it('should return Config object with all required fields', () => {
    process.env.LINEAR_API_KEY = 'test-key';
    process.env.LINEAR_TEAM_ID = 'test-team';

    const config = getConfig();

    expect(config).toHaveProperty('linearApiKey');
    expect(config).toHaveProperty('linearTeamId');
    expect(config.linearApiKey).toBe('test-key');
    expect(config.linearTeamId).toBe('test-team');
  });
});
