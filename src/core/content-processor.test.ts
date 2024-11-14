import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ContentProcessor } from "./content-processor";
import type { FileContent } from "../types";
import { ParseError } from "../utils/errors";
import * as logger from "../utils/logger";

describe("ContentProcessor", () => {
  beforeEach(() => {
    vi.spyOn(logger, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("parse", () => {
    const processor = new ContentProcessor();

    it("should parse valid content correctly", () => {
      const input = [
        "// ./file1.ts",
        "console.log(\"test1\");",
        "",
        "// ./file2.ts",
        "console.log(\"test2\");",
        "",
      ].join("\n");

      const files = processor.parse(input);
      expect(files).toHaveLength(2);
      expect(files[0]).toEqual({
        path: "file1.ts",
        content: "console.log(\"test1\");\n",
      });
      expect(files[1]).toEqual({
        path: "file2.ts",
        content: "console.log(\"test2\");\n",
      });
    });

    it("should handle empty lines between files", () => {
      const input = [
        "// ./file1.ts",
        "content1",
        "",
        "",
        "// ./file2.ts",
        "content2",
      ].join("\n");

      const files = processor.parse(input);
      expect(files).toHaveLength(2);
      expect(files[0].content).toBe("content1\n");
      expect(files[1].content).toBe("content2\n");
    });

    it("should handle files with multiple lines", () => {
      const input = [
        "// ./file1.ts",
        "line1",
        "line2",
        "line3",
        "",
        "// ./file2.ts",
        "content2",
      ].join("\n");

      const files = processor.parse(input);
      expect(files).toHaveLength(2);
      expect(files[0].content).toBe("line1\nline2\nline3\n");
    });

    it("should throw ParseError for invalid content", () => {
      const input = "content without file path";
      expect(() => processor.parse(input)).toThrow(ParseError);
    });

    it("should ignore non-file-path comments", () => {
      const input = [
        "// コメント: これは無視される",
        "// ./file1.ts",
        "content1",
        "// 通常のコメント",
        "// ./file2.ts",
        "content2",
      ].join("\n");

      const files = processor.parse(input);
      expect(files).toHaveLength(2);
    });

    it("should handle Windows-style line endings", () => {
      const input = "// ./file1.ts\r\ncontent1\r\n// ./file2.ts\r\ncontent2";
      const files = processor.parse(input);
      expect(files).toHaveLength(2);
      expect(files[0].content.replace(/\r\n/g, "\n")).toBe("content1\n");
      expect(files[1].content.replace(/\r\n/g, "\n")).toBe("content2\n");
    });
  });

  describe("format", () => {
    const processor = new ContentProcessor();

    it("should format files correctly", () => {
      const files: FileContent[] = [
        { path: "file1.ts", content: "content1" },
        { path: "file2.ts", content: "content2" },
      ];

      const result = processor.format(files);
      const expected = [
        "// ./file1.ts",
        "",
        "content1",
        "// ./file2.ts",
        "",
        "content2",
        "",
      ].join("\n");

      expect(result).toBe(expected);
    });

    it("should handle empty file array", () => {
      const result = processor.format([]);
      expect(result).toBe("\n");
    });

    it("should ensure trailing newline", () => {
      const files: FileContent[] = [
        { path: "file1.ts", content: "content1\n" },
      ];

      const result = processor.format(files);
      expect(result.endsWith("\n")).toBe(true);
      expect(result.match(/\n/g)?.length).toBe(3); // ファイルパス後、内容後、最後
    });

    it("should add './' prefix to paths", () => {
      const files: FileContent[] = [
        { path: "file1.ts", content: "content1" },
      ];

      const result = processor.format(files);
      expect(result).toContain("// ./file1.ts");
    });
  });

  describe("isTargetFile", () => {
    it("should match default patterns", () => {
      const processor = new ContentProcessor();
      expect(processor.isTargetFile("test.ts")).toBe(true);
      expect(processor.isTargetFile("test.js")).toBe(true);
      expect(processor.isTargetFile("src/test.ts")).toBe(true);
      expect(processor.isTargetFile("src/test.js")).toBe(true);
    });

    it("should respect custom patterns", () => {
      const processor = new ContentProcessor({
        filePattern: ["**/*.md", "**/*.txt"],
        ignorePattern: ["test/**"],
      });

      expect(processor.isTargetFile("readme.md")).toBe(true);
      expect(processor.isTargetFile("docs/guide.txt")).toBe(true);
      expect(processor.isTargetFile("test.ts")).toBe(false);
      expect(processor.isTargetFile("test/readme.md")).toBe(false);
    });

    it("should ignore node_modules by default", () => {
      const processor = new ContentProcessor();
      expect(processor.isTargetFile("node_modules/test.ts")).toBe(false);
      expect(processor.isTargetFile("node_modules/package/test.js")).toBe(false);
    });

    it("should handle nested paths", () => {
      const processor = new ContentProcessor();
      expect(processor.isTargetFile("src/components/test.ts")).toBe(true);
      expect(processor.isTargetFile("deep/nested/path/test.js")).toBe(true);
    });
  });
});
