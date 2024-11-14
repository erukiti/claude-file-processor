import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkPathSecurity } from "./security";
import { SecurityError } from "./errors";
import { lstat } from "node:fs/promises";

vi.mock("node:fs/promises", () => ({
  lstat: vi.fn(),
}));

describe("security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect directory traversal attempts", async () => {
    await expect(
      checkPathSecurity("../test.ts", "/base/dir")
    ).rejects.toThrow(SecurityError);
  });

  it("should detect symlinks when not allowed", async () => {
    (lstat as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      isSymbolicLink: () => true,
    });

    await expect(
      checkPathSecurity("test.ts", "/base/dir", { allowSymlinks: false })
    ).rejects.toThrow(SecurityError);
  });

  it("should allow safe paths", async () => {
    (lstat as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      isSymbolicLink: () => false,
    });

    const result = await checkPathSecurity("test.ts", "/base/dir");
    expect(result.isValid).toBe(true);
  });
});
