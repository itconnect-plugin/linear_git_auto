import { describe, it, expect } from 'vitest';
import {
  validateBranchName,
  extractIssueId,
} from '../../../src/github/branch-validator';

describe('Branch Name Validator', () => {
  describe('validateBranchName', () => {
    it('should validate correct branch name', () => {
      const result = validateBranchName('ABC-123-implement-auth');

      expect(result.valid).toBe(true);
      expect(result.issueId).toBe('ABC-123');
      expect(result.slug).toBe('implement-auth');
      expect(result.error).toBeUndefined();
    });

    it('should validate branch with multiple hyphens in slug', () => {
      const result = validateBranchName('XYZ-456-fix-user-auth-bug');

      expect(result.valid).toBe(true);
      expect(result.issueId).toBe('XYZ-456');
      expect(result.slug).toBe('fix-user-auth-bug');
    });

    it('should reject branch without issue ID', () => {
      const result = validateBranchName('feature-authentication');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('pattern');
    });

    it('should reject branch with lowercase prefix', () => {
      const result = validateBranchName('abc-123-feature');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject branch without slug', () => {
      const result = validateBranchName('ABC-123');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept underscores in slug', () => {
      const result = validateBranchName('DEV-789-add_new_feature');

      expect(result.valid).toBe(true);
      expect(result.issueId).toBe('DEV-789');
      expect(result.slug).toBe('add_new_feature');
    });
  });

  describe('extractIssueId', () => {
    it('should extract issue ID from valid branch name', () => {
      const issueId = extractIssueId('ABC-123-implement-feature');
      expect(issueId).toBe('ABC-123');
    });

    it('should extract issue ID from branch with underscores', () => {
      const issueId = extractIssueId('XYZ-456-fix_bug_report');
      expect(issueId).toBe('XYZ-456');
    });

    it('should return null for invalid branch name', () => {
      const issueId = extractIssueId('feature-branch');
      expect(issueId).toBeNull();
    });

    it('should return null for empty string', () => {
      const issueId = extractIssueId('');
      expect(issueId).toBeNull();
    });

    it('should extract first issue ID if multiple present', () => {
      const issueId = extractIssueId('ABC-123-fix-for-XYZ-456');
      expect(issueId).toBe('ABC-123');
    });
  });
});
