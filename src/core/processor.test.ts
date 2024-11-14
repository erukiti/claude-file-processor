import { describe, it, expect, vi, beforeEach } from "vitest";
import { extract, pack } from "./processor";
import type { ProcessOptions } from "../types";

// モックの設定
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

vi.mock("globby", async () => ({
  globby: vi.fn(),
}));

// モジュールのインポート
import { readFileContent, writeFileContent } from "../utils/file";
import clipboard from "clipboardy";
import { globby } from "globby";
import { resolve } from "node:path";

describe("processor", () => {
  const TEST_OUTPUT_DIR = "./output";
  const TEST_INPUT_DIR = "./input";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extract", () => {
    const mockOptions: ProcessOptions = {
      dryRun: false,
      useClipboard: false,
      outputDir: TEST_OUTPUT_DIR,
    };

    it("should extract files correctly", async () => {
      const input = `// file1.ts
console.log("test");

// file2.ts
console.log("test2");`;

      const files = await extract(input, { ...mockOptions, dryRun: true });

      expect(files).toHaveLength(2);
      expect(files[0].path).toBe("file1.ts");
      expect(files[0].content).toBe('console.log("test");');
      expect(files[1].path).toBe("file2.ts");
      expect(files[1].content).toBe('console.log("test2");');
    });

    it("should write files when not in dry-run mode", async () => {
      const input = `// file1.ts
console.log("test");`;

      await extract(input, mockOptions);

      expect(writeFileContent).toHaveBeenCalledWith(
        resolve(TEST_OUTPUT_DIR, "file1.ts"),
        'console.log("test");',
      );
    });

    it("should throw error when outputDir is not specified", async () => {
      const input = `// file1.ts
console.log("test");`;

      const options: ProcessOptions = {
        dryRun: false,
        useClipboard: false,
      };

      await expect(extract(input, options)).rejects.toThrow(
        "Output directory must be specified",
      );
    });
    it("should ignore normal comments", async () => {
      const input = `// file1.ts
console.log("test");

// これはコメントです
// (このコメントも無視)
// テスト：説明
console.log("more");

// file2.ts
console.log("test2");`;

      const files = await extract(input, { ...mockOptions, dryRun: true });

      expect(files).toHaveLength(2);
      expect(files[0].path).toBe("file1.ts");
      expect(files[0].content).toBe(
        'console.log("test");\n\n// これはコメントです\n// (このコメントも無視)\n// テスト：説明\nconsole.log("more");',
      );
      expect(files[1].path).toBe("file2.ts");
      expect(files[1].content).toBe('console.log("test2");');
    });

    it("should handle paths with directories", async () => {
      const input = `// src/utils/file.ts
console.log("test");

// src/core/processor.ts
console.log("test2");`;

      const files = await extract(input, { ...mockOptions, dryRun: true });

      expect(files).toHaveLength(2);
      expect(files[0].path).toBe("src/utils/file.ts");
      expect(files[1].path).toBe("src/core/processor.ts");
    });
  });

  describe("pack", () => {
    const mockOptions: ProcessOptions = {
      dryRun: false,
      useClipboard: false,
      inputDir: TEST_INPUT_DIR,
    };

    beforeEach(() => {
      (globby as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
        "file1.ts",
        "file2.ts",
      ]);
      (readFileContent as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("content1")
        .mockResolvedValueOnce("content2");
    });

    it("should pack files correctly", async () => {
      const result = await pack(TEST_INPUT_DIR, mockOptions);
      expect(result).toBe(`// file1.ts

content1

// file2.ts

content2`);
    });

    it("should copy to clipboard when useClipboard is true", async () => {
      await pack(TEST_INPUT_DIR, { ...mockOptions, useClipboard: true });

      expect(clipboard.write).toHaveBeenCalled();
    });

    it("should throw error when inputDir is not specified", async () => {
      const options: ProcessOptions = {
        dryRun: false,
        useClipboard: false,
      };

      await expect(pack(TEST_INPUT_DIR, options)).rejects.toThrow(
        "Input directory must be specified",
      );
    });
  });
});
