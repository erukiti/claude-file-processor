import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkPathSecurity, type SecurityCheckOptions } from "./security";
import { SecurityError } from "./errors";
import { lstat } from "node:fs/promises";
import { resolve } from "node:path";

vi.mock("node:fs/promises", () => ({
  lstat: vi.fn(),
}));

describe("security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkPathSecurity", () => {
    const mockOptions: SecurityCheckOptions = {
      allowSymlinks: false,
      maxSymlinkDepth: 10,
      allowedPaths: [],
    };

    it("should detect directory traversal attempts", async () => {
      await expect(
        checkPathSecurity("../test.ts", "/base/dir", mockOptions)
      ).rejects.toThrow(SecurityError);

      await expect(
        checkPathSecurity("../../test.ts", "/base/dir", mockOptions)
      ).rejects.toThrow(SecurityError);

      await expect(
        checkPathSecurity("/etc/passwd", "/base/dir", mockOptions)
      ).rejects.toThrow(SecurityError);
    });

    it("should detect symlinks when not allowed", async () => {
      (lstat as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        isSymbolicLink: () => true,
      });

      await expect(
        checkPathSecurity("test.ts", "/base/dir", mockOptions)
      ).rejects.toThrow(SecurityError);

      expect(lstat).toHaveBeenCalledWith(resolve("/base/dir", "test.ts"));
    });

    it("should allow symlinks when explicitly enabled", async () => {
      (lstat as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        isSymbolicLink: () => true,
      });

      const options: SecurityCheckOptions = {
        ...mockOptions,
        allowSymlinks: true,
      };

      const result = await checkPathSecurity("test.ts", "/base/dir", options);
      expect(result.isValid).toBe(true);
    });

    it("should allow safe paths", async () => {
      (lstat as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        isSymbolicLink: () => false,
      });

      const result = await checkPathSecurity(
        "test.ts",
        "/base/dir",
        mockOptions
      );
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toBe("test.ts");
      expect(result.errors).toHaveLength(0);
    });

    it("should handle missing files gracefully", async () => {
      (lstat as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("ENOENT")
      );

      const result = await checkPathSecurity(
        "nonexistent.ts",
        "/base/dir",
        mockOptions
      );
      expect(result.isValid).toBe(true);
    });

    it("should normalize paths correctly", async () => {
      (lstat as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        isSymbolicLink: () => false,
      });

      const result = await checkPathSecurity(
        "./test/../file.ts",
        "/base/dir",
        mockOptions
      );
      expect(result.normalizedPath).toBe("file.ts");
      expect(result.isValid).toBe(true);
    });
  });
});
