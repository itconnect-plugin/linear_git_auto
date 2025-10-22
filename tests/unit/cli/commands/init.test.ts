import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import {
  parseEnvFile,
  readExistingEnv,
  updateEnvFile,
} from '../../../../src/cli/commands/init';

// Mock modules
vi.mock('fs');
vi.mock('inquirer');
vi.mock('../../../../src/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Init Command - .env Preservation', () => {
  const mockCwd = '/test/project';
  const envPath = path.join(mockCwd, '.env');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue(mockCwd);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Reading existing .env file', () => {
    it('should read existing .env file and return parsed values', () => {
      // Arrange: .env 파일이 이미 존재
      const existingEnv = 'LINEAR_API_KEY=existing-key\nLINEAR_TEAM_ID=existing-team\n';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingEnv);

      // Act: readExistingEnv 함수 호출
      const result = readExistingEnv(envPath);

      // Assert: 기존 값이 올바르게 파싱되어야 함
      expect(fs.existsSync).toHaveBeenCalledWith(envPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(envPath, 'utf-8');
      expect(result).toEqual({
        LINEAR_API_KEY: 'existing-key',
        LINEAR_TEAM_ID: 'existing-team',
      });
    });

    it('should handle missing .env file gracefully', () => {
      // Arrange: .env 파일이 없음
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // Act: readExistingEnv 함수 호출
      const result = readExistingEnv(envPath);

      // Assert: 빈 객체 반환되어야 함
      expect(result).toEqual({});
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Preserving existing .env content', () => {
    it('should preserve GITHUB_TOKEN and other env vars when updating', () => {
      // Arrange: GITHUB_TOKEN 등 다른 환경변수가 포함된 .env
      const existingEnv = `LINEAR_API_KEY=old-key
LINEAR_TEAM_ID=old-team
GITHUB_TOKEN=github-token-123
GITHUB_REPO_OWNER=myuser
GITHUB_REPO_NAME=myrepo
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingEnv);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      // Act: updateEnvFile 호출
      updateEnvFile(envPath, {
        LINEAR_API_KEY: 'new-key',
        LINEAR_TEAM_ID: 'new-team',
      });

      // Assert: writeFileSync가 호출되었고, 모든 환경변수 보존
      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;

      expect(writtenContent).toContain('GITHUB_TOKEN=github-token-123');
      expect(writtenContent).toContain('GITHUB_REPO_OWNER=myuser');
      expect(writtenContent).toContain('GITHUB_REPO_NAME=myrepo');
      expect(writtenContent).toContain('LINEAR_API_KEY=new-key');
      expect(writtenContent).toContain('LINEAR_TEAM_ID=new-team');
    });

    it('should not overwrite entire .env file', () => {
      const existingEnv = `LINEAR_API_KEY=old
GITHUB_TOKEN=keep-this
CUSTOM_VAR=important
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingEnv);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      // Act: updateEnvFile 호출
      updateEnvFile(envPath, {
        LINEAR_API_KEY: 'new-value',
      });

      // Assert: 다른 환경변수가 보존되는지 확인
      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('GITHUB_TOKEN=keep-this');
      expect(writtenContent).toContain('CUSTOM_VAR=important');
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed .env file', () => {
      const malformedEnv = `LINEAR_API_KEY=key
BROKEN LINE WITHOUT EQUALS
LINEAR_TEAM_ID=team
`;

      // Should not crash
      const result = parseEnvFile(malformedEnv);
      expect(result).toHaveProperty('LINEAR_API_KEY', 'key');
      expect(result).toHaveProperty('LINEAR_TEAM_ID', 'team');
      expect(result).not.toHaveProperty('BROKEN LINE WITHOUT EQUALS');
    });

    it('should handle empty .env file', () => {
      const result = parseEnvFile('');
      expect(result).toEqual({});
    });

    it('should skip comment lines', () => {
      const envWithComments = `# This is a comment
LINEAR_API_KEY=key
# Another comment
LINEAR_TEAM_ID=team
`;

      const result = parseEnvFile(envWithComments);
      expect(result).toEqual({
        LINEAR_API_KEY: 'key',
        LINEAR_TEAM_ID: 'team',
      });
    });
  });
});
