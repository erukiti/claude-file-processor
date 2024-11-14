import { describe, it, expect, vi } from "vitest";
import { readFileContent, writeFileContent } from "./file";
import { readFile, writeFile, mkdir } from "node:fs/promises";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

describe("file utils", () => {
  describe("readFileContent", () => {
    it("should read file content correctly", async () => {
      const mockContent = "test content";
      (readFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockContent,
      );

      const result = await readFileContent("test.txt");
      expect(result).toBe(mockContent);
      expect(readFile).toHaveBeenCalledWith("test.txt", "utf-8");
    });

    it("should throw FileOperationError when read fails", async () => {
      const mockError = new Error("Read error");
      (readFile as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(readFileContent("test.txt")).rejects.toThrow(
        "File operation failed at test.txt: Read error",
      );
    });
  });

  describe("writeFileContent", () => {
    it("should write file content correctly", async () => {
      (mkdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );
      (writeFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );

      await writeFileContent("test.txt", "test content");
      expect(mkdir).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(
        "test.txt",
        "test content",
        "utf-8",
      );
    });

    it("should throw FileOperationError when write fails", async () => {
      const mockError = new Error("Write error");
      (mkdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );
      (writeFile as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(
        writeFileContent("test.txt", "test content"),
      ).rejects.toThrow("File operation failed at test.txt: Write error");
    });
  });
});
