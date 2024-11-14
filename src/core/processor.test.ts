import { describe, it, expect, vi, beforeEach } from "vitest";
import { extract, pack } from "./processor";
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

vi.mock("globby", async () => ({
  globby: vi.fn(),
}));

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
      const input =
        "// ./file1.ts\nconsole.log(\"test\");\n\n// ./file2.ts\nconsole.log(\"test2\");\n";

      const files = await extract(input, { ...mockOptions, dryRun: true });

      expect(files).toHaveLength(2);
      expect(files[0].path).toBe("file1.ts");
      expect(files[0].content).toBe('console.log("test");\n');
      expect(files[1].path).toBe("file2.ts");
      expect(files[1].content).toBe('console.log("test2");\n');
    });

    it("should write files when not in dry-run mode", async () => {
      const input = "// ./file1.ts\nconsole.log(\"test\");\n";

      await extract(input, mockOptions);

      expect(writeFileContent).toHaveBeenCalledWith(
        resolve(TEST_OUTPUT_DIR, "file1.ts"),
        'console.log("test");\n',
      );
    });

    it("should throw ValidationError when outputDir is not specified", async () => {
      const input = "// ./file1.ts\nconsole.log(\"test\");\n";

      const options: ProcessOptions = {
        dryRun: false,
        useClipboard: false,
      };

      await expect(() => extract(input, options)).rejects.toThrow(
        ValidationError,
      );
      await expect(() => extract(input, options)).rejects.toThrow(
        "Output directory must be specified",
      );
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
        .mockResolvedValueOnce("content1\n")
        .mockResolvedValueOnce("content2\n");
    });

    it("should pack files correctly", async () => {
      const result = await pack(TEST_INPUT_DIR, mockOptions);

      expect(result).toContain("// ./file1.ts");
      expect(result).toContain("content1\n");
      expect(result).toContain("// ./file2.ts");
      expect(result).toContain("content2\n");
    });

    it("should copy to clipboard when useClipboard is true", async () => {
      await pack(TEST_INPUT_DIR, { ...mockOptions, useClipboard: true });

      expect(clipboard.write).toHaveBeenCalled();
    });

    it("should throw ValidationError when inputDir is not specified", async () => {
      const options: ProcessOptions = {
        dryRun: false,
        useClipboard: false,
      };

      await expect(() => pack(TEST_INPUT_DIR, options)).rejects.toThrow(
        ValidationError,
      );
      await expect(() => pack(TEST_INPUT_DIR, options)).rejects.toThrow(
        "Input directory must be specified",
      );
    });
  });
});
