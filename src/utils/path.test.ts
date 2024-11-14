import { describe, it, expect } from "vitest";
import { isFilePath, extractPathFromLine, toRelativePath } from "./path";

describe("path utils", () => {
  describe("isFilePath", () => {
    it("should identify valid file paths", () => {
      expect(isFilePath("// ./file.ts")).toBe(true);
      expect(isFilePath("// ./src/file.ts")).toBe(true);
      expect(isFilePath("// ./path/to/file.js")).toBe(true);
      expect(isFilePath("// ./.gitignore")).toBe(true);
      expect(isFilePath("// ./package.json")).toBe(true);
    });

    it("should reject paths not starting with './'", () => {
      expect(isFilePath("// file.ts")).toBe(false);
      expect(isFilePath("// src/file.ts")).toBe(false);
      expect(isFilePath("// /absolute/path/file.ts")).toBe(false);
    });

    it("should reject invalid file paths", () => {
      expect(isFilePath("// ./モックの設定")).toBe(false);
      expect(isFilePath("// ./(ファイル設定)")).toBe(false);
      expect(isFilePath("// ./テスト：説明")).toBe(false);
      expect(isFilePath("// ./処理の説明。")).toBe(false);
      expect(isFilePath("これは普通の行")).toBe(false);
      expect(isFilePath("// ./これは、説明です")).toBe(false);
    });
  });

  describe("extractPathFromLine", () => {
    it("should extract path correctly", () => {
      expect(extractPathFromLine("// ./file.ts")).toBe("file.ts");
      expect(extractPathFromLine("// ./src/file.ts")).toBe("src/file.ts");
      expect(extractPathFromLine("// ./path/to/file.js")).toBe(
        "path/to/file.js",
      );
    });
  });

  describe("toRelativePath", () => {
    it("should add './' prefix if missing", () => {
      expect(toRelativePath("file.ts")).toBe("./file.ts");
      expect(toRelativePath("src/file.ts")).toBe("./src/file.ts");
    });

    it("should not modify paths that already start with './'", () => {
      expect(toRelativePath("./file.ts")).toBe("./file.ts");
      expect(toRelativePath("./src/file.ts")).toBe("./src/file.ts");
    });
  });
});
