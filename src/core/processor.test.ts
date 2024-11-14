import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileProcessor } from "./file-processor";
import { ContentProcessor } from "./content-processor";
import type { ProcessOptions } from "../types";
import { ValidationError } from "../utils/errors";

vi.mock("../utils/file", () => ({
  readFileContent: vi.fn(),
  writeFileContent: vi.fn(),
}));

vi.mock("clipboardy", () => ({
  default: {
    write: vi.fn(),
    read: vi.fn(),
  },
}));

vi.mock("../utils/debug", () => ({
  debugLog: vi.fn(),
}));

vi.mock("globby", () => ({
  globby: vi.fn(),
}));

describe("Processors", () => {
  describe("ContentProcessor", () => {
    const contentProcessor = new ContentProcessor();

    it("should parse content correctly", () => {
      const input = "// ./file1.ts\nconsole.log(\"test\");\n\n// ./file2.ts\nconsole.log(\"test2\");";

      const files = contentProcessor.parse(input);
      expect(files).toHaveLength(2);
      expect(files[0].path).toBe("file1.ts");
      expect(files[0].content).toBe('console.log("test");\n');
    });

    it("should format files correctly", () => {
      const files = [
        { path: "file1.ts", content: "content1" },
        { path: "file2.ts", content: "content2" },
      ];

      const result = contentProcessor.format(files);
      expect(result).toContain("// ./file1.ts");
      expect(result).toContain("content1");
      expect(result).toContain("// ./file2.ts");
      expect(result).toContain("content2");
    });

    it("should correctly identify target files", () => {
      expect(contentProcessor.isTargetFile("test.ts")).toBe(true);
      expect(contentProcessor.isTargetFile("test.js")).toBe(true);
      expect(contentProcessor.isTargetFile("node_modules/test.ts")).toBe(false);
      expect(contentProcessor.isTargetFile("test.css")).toBe(false);
    });
  });

  describe("FileProcessor", () => {
    let fileProcessor: FileProcessor;
    let contentProcessor: ContentProcessor;
    const mockOptions: ProcessOptions = {
      dryRun: false,
      useClipboard: false,
      outputDir: "./output",
      inputDir: "./input",
    };

    beforeEach(() => {
      contentProcessor = new ContentProcessor();
      fileProcessor = new FileProcessor(contentProcessor, mockOptions);
      vi.clearAllMocks();
    });

    it("should throw ValidationError when directories are not specified", async () => {
      const invalidOptions: ProcessOptions = {
        dryRun: false,
        useClipboard: false,
      };

      const invalidProcessor = new FileProcessor(contentProcessor, invalidOptions);

      await expect(invalidProcessor.extract("content")).rejects.toThrow(
        ValidationError
      );
      await expect(invalidProcessor.pack("./dir")).rejects.toThrow(
        ValidationError
      );
    });
  });
});
