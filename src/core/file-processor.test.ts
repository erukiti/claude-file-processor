import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { FileProcessor } from "./file-processor";
import { ContentProcessor } from "./content-processor";
import type { ProcessOptions, FileContent } from "../types";
import { ValidationError, SecurityError } from "../utils/errors";
import { readFileContent, writeFileContent } from "../utils/file";
import { checkPathSecurity } from "../utils/security";
import { globby } from "globby";
import clipboard from "clipboardy";
import * as logger from "../utils/logger";

// モックのセットアップ
vi.mock("../utils/file", () => ({
  readFileContent: vi.fn(),
  writeFileContent: vi.fn(),
}));

vi.mock("../utils/security", () => ({
  checkPathSecurity: vi.fn().mockResolvedValue({ isValid: true }),
}));

vi.mock("globby", () => ({
  globby: vi.fn(),
}));

vi.mock("clipboardy", () => ({
  default: {
    write: vi.fn(),
    read: vi.fn(),
  },
}));

describe("FileProcessor", () => {
  let contentProcessor: ContentProcessor;
  const defaultOptions: ProcessOptions = {
    dryRun: false,
    useClipboard: false,
    outputDir: "./output",
    inputDir: "./input",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    contentProcessor = new ContentProcessor();
    vi.spyOn(contentProcessor, "parse");
    vi.spyOn(contentProcessor, "format");
    vi.spyOn(contentProcessor, "isTargetFile");
    vi.spyOn(logger, "info").mockImplementation(() => undefined);
  });

  describe("extract", () => {
    it("should extract files correctly", async () => {
      const processor = new FileProcessor(contentProcessor, defaultOptions);
      const mockFiles: FileContent[] = [
        { path: "file1.ts", content: "content1" },
        { path: "file2.ts", content: "content2" },
      ];

      (contentProcessor.parse as Mock).mockReturnValue(mockFiles);

      const result = await processor.extract("test content");

      expect(contentProcessor.parse).toHaveBeenCalledWith("test content");
      expect(writeFileContent).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockFiles);
    });

    it("should not write files in dry-run mode", async () => {
      const processor = new FileProcessor(
        contentProcessor,
        { ...defaultOptions, dryRun: true }
      );
      const mockFiles = [{ path: "file1.ts", content: "content1" }];
      (contentProcessor.parse as Mock).mockReturnValue(mockFiles);

      await processor.extract("test content");

      expect(writeFileContent).not.toHaveBeenCalled();
    });

    it("should handle security check failures", async () => {
      const processor = new FileProcessor(contentProcessor, defaultOptions);
      const mockFiles = [{ path: "../file1.ts", content: "content1" }];
      (contentProcessor.parse as Mock).mockReturnValue(mockFiles);
      (checkPathSecurity as Mock).mockRejectedValueOnce(
        new SecurityError("Security violation")
      );

      await expect(processor.extract("test content")).rejects.toThrow(
        SecurityError
      );
    });

    it("should validate output directory", async () => {
      const processor = new FileProcessor(
        contentProcessor,
        { ...defaultOptions, outputDir: undefined }
      );

      await expect(processor.extract("test content")).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe("pack", () => {
    beforeEach(() => {
      (globby as Mock).mockResolvedValue(["file1.ts", "file2.ts"]);
      (readFileContent as Mock).mockResolvedValue("test content");
      (contentProcessor.isTargetFile as Mock).mockReturnValue(true);
      (contentProcessor.format as Mock).mockReturnValue("formatted content");
      (checkPathSecurity as Mock).mockResolvedValue({ isValid: true });
    });

    it("should pack files correctly", async () => {
      const processor = new FileProcessor(contentProcessor, defaultOptions);
      const result = await processor.pack("./src");

      expect(globby).toHaveBeenCalled();
      expect(readFileContent).toHaveBeenCalledTimes(2);
      expect(contentProcessor.format).toHaveBeenCalled();
      expect(result).toBe("formatted content");
    });

    it("should copy to clipboard when specified", async () => {
      const processor = new FileProcessor(
        contentProcessor,
        { ...defaultOptions, useClipboard: true }
      );

      await processor.pack("./src");

      expect(clipboard.write).toHaveBeenCalledWith("formatted content");
    });

    it("should validate input directory", async () => {
      const processor = new FileProcessor(
        contentProcessor,
        { ...defaultOptions, inputDir: undefined }
      );

      await expect(processor.pack("./src")).rejects.toThrow(ValidationError);
    });

    it("should handle security check failures", async () => {
      const processor = new FileProcessor(contentProcessor, defaultOptions);
      (checkPathSecurity as Mock)
        .mockReset()
        .mockRejectedValueOnce(new SecurityError("Security violation"));

      await expect(processor.pack("./src")).rejects.toThrow(SecurityError);
    });

    it("should filter files based on ContentProcessor", async () => {
      const processor = new FileProcessor(contentProcessor, defaultOptions);
      (contentProcessor.isTargetFile as Mock)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await processor.pack("./src");

      expect(readFileContent).toHaveBeenCalledTimes(1);
    });

    it("should not copy to clipboard in dry-run mode", async () => {
      const processor = new FileProcessor(
        contentProcessor,
        { ...defaultOptions, dryRun: true, useClipboard: true }
      );

      const result = await processor.pack("./src");

      expect(result).toBe("formatted content");
      expect(clipboard.write).not.toHaveBeenCalled();
    });
  });
});
