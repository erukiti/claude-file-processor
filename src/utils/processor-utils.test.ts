import { describe, it, expect } from 'vitest';
import { parseContent, formatContent, trimEmptyLines } from './processor-utils';

describe('processor utils', () => {
  describe('trimEmptyLines', () => {
    it('should trim empty lines', () => {
      expect(trimEmptyLines('\n\ncontent\n\n')).toBe('content');
      expect(trimEmptyLines('content')).toBe('content');
      expect(trimEmptyLines('\ncontent\n')).toBe('content');
    });
  });

  describe('parseContent', () => {
    it('should parse content correctly', () => {
      const input = `// file1.ts
console.log("test");\n\n// file2.ts
console.log("test2");`;

      const result = parseContent(input);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        path: 'file1.ts',
        content: 'console.log("test");'
      });
      expect(result[1]).toEqual({
        path: 'file2.ts',
        content: 'console.log("test2");'
      });
    });
  });

  describe('formatContent', () => {
    it('should format content correctly', () => {
      const input = [
        { path: 'file1.ts', content: 'console.log("test");' },
        { path: 'file2.ts', content: 'console.log("test2");' }
      ];

      const result = formatContent(input);
      expect(result).toBe(`// file1.ts\n\nconsole.log("test");\n\n// file2.ts\n\nconsole.log("test2");`);
    });
  });
});