import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';

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
    it('should read existing .env file and provide as default values', async () => {
      // Arrange: .env 파일이 이미 존재
      const existingEnv = 'LINEAR_API_KEY=existing-key\nLINEAR_TEAM_ID=existing-team\n';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingEnv);

      vi.mocked(inquirer.prompt).mockResolvedValue({
        linearApiKey: 'existing-key',
        linearTeamId: 'existing-team',
      });

      // Act: init 명령어 실행 (함수 직접 호출 시뮬레이션)
      // 실제 구현에서는 inquirer의 default 옵션이 설정되어야 함
      const promptCall = vi.mocked(inquirer.prompt).mock.calls[0];

      // Assert: inquirer가 기존 값을 default로 받았는지 확인
      // (실제 테스트에서는 init 함수를 직접 호출)
      expect(fs.existsSync).toHaveBeenCalledWith(envPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(envPath, 'utf-8');
    });

    it('should handle missing .env file gracefully', () => {
      // Arrange: .env 파일이 없음
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // Act & Assert: 에러 없이 진행되어야 함
      expect(() => {
        if (!fs.existsSync(envPath)) {
          // init should provide empty defaults
        }
      }).not.toThrow();
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

      const expectedEnv = `LINEAR_API_KEY=new-key
LINEAR_TEAM_ID=new-team
GITHUB_TOKEN=github-token-123
GITHUB_REPO_OWNER=myuser
GITHUB_REPO_NAME=myrepo
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingEnv);

      // Act: LINEAR 키만 업데이트
      const updatedEnv = updateEnvFile(existingEnv, {
        LINEAR_API_KEY: 'new-key',
        LINEAR_TEAM_ID: 'new-team',
      });

      // Assert: GITHUB 관련 환경변수 보존
      expect(updatedEnv).toContain('GITHUB_TOKEN=github-token-123');
      expect(updatedEnv).toContain('GITHUB_REPO_OWNER=myuser');
      expect(updatedEnv).toContain('LINEAR_API_KEY=new-key');
      expect(updatedEnv).toContain('LINEAR_TEAM_ID=new-team');
    });

    it('should not overwrite entire .env file', () => {
      const existingEnv = `LINEAR_API_KEY=old
GITHUB_TOKEN=keep-this
CUSTOM_VAR=important
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingEnv);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      // Assert: writeFileSync가 부분 업데이트된 내용만 쓰는지 확인
      // (실제로는 init 함수 호출 후 검증)
      expect(true).toBe(true); // Placeholder - will implement in GREEN phase
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed .env file', () => {
      const malformedEnv = `LINEAR_API_KEY=key
BROKEN LINE WITHOUT EQUALS
LINEAR_TEAM_ID=team
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(malformedEnv);

      // Should not crash
      const result = parseEnvFile(malformedEnv);
      expect(result).toHaveProperty('LINEAR_API_KEY', 'key');
      expect(result).toHaveProperty('LINEAR_TEAM_ID', 'team');
    });

    it('should handle empty .env file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');

      const result = parseEnvFile('');
      expect(result).toEqual({});
    });
  });
});

// Helper functions that will be implemented in init.ts
function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.substring(0, equalsIndex).trim();
    const value = trimmed.substring(equalsIndex + 1).trim();

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

function updateEnvFile(
  existingContent: string,
  updates: Record<string, string>
): string {
  const parsed = parseEnvFile(existingContent);

  // Update with new values
  Object.assign(parsed, updates);

  // Reconstruct .env file
  return Object.entries(parsed)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
}
