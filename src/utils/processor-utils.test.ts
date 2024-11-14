import { describe, it, expect } from "vitest";
import { parseContent, formatContent, trimEmptyLines } from "./processor-utils";

describe("processor utils", () => {
  describe("trimEmptyLines", () => {
    it("should trim empty lines but keep trailing newline", () => {
      expect(trimEmptyLines("\n\ncontent\n\n")).toBe("content\n");
      expect(trimEmptyLines("content")).toBe("content\n");
      expect(trimEmptyLines("\ncontent\n")).toBe("content\n");
      expect(trimEmptyLines("content\n")).toBe("content\n");
      expect(trimEmptyLines("content\n\n\n")).toBe("content\n");
    });
  });

  describe("parseContent", () => {
    it("should parse content correctly and ensure trailing newline", () => {
      const input = `// ./file1.ts
console.log("test");\n\n// ./file2.ts
console.log("test2");`;

      const result = parseContent(input);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        path: "file1.ts",
        content: 'console.log("test");\n'
      });
      expect(result[1]).toEqual({
        path: "file2.ts",
        content: 'console.log("test2");\n'
      });
    });

    it("should ignore paths not starting with './' but maintain trailing newline", () => {
      const input = `// file1.ts
content1\n\n// ./file2.ts
content2`;

      const result = parseContent(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        path: "file2.ts",
        content: "content2\n"
      });
    });
  });

  describe("formatContent", () => {
    it("should format content correctly with './' prefix and trailing newline", () => {
      const input = [
        { path: "file1.ts", content: 'console.log("test");' },
        { path: "file2.ts", content: 'console.log("test2");' }
      ];

      expect(formatContent(input)).toBe([
        "// ./file1.ts",
        "",
        'console.log("test");\n',
        "// ./file2.ts",
        "",
        'console.log("test2");\n',
        ""
      ].join("\n"));
    });

    it("should handle empty file list", () => {
      const result = formatContent([]);
      expect(result).toBe("\n");
    });

    it("should handle content that already has trailing newline", () => {
      const input = [
        { path: "file1.ts", content: "content1\n" },
        { path: "file2.ts", content: "content2\n" }
      ];

      expect(formatContent(input)).toBe([
        "// ./file1.ts",
        "",
        "content1\n",
        "// ./file2.ts",
        "",
        "content2\n",
        ""
      ].join("\n"));
    });
  });
});
