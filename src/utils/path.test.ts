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
      expect(isFilePath("// ./test-file.ts")).toBe(true);
      expect(isFilePath("// ./snake_case_file.js")).toBe(true);
    });

    it("should reject invalid file paths", () => {
      expect(isFilePath("// コメント：設定")).toBe(false);
      expect(isFilePath("// (file.ts)")).toBe(false);
      expect(isFilePath("// ./file(test).ts")).toBe(false);
      expect(isFilePath("// ./file：test.ts")).toBe(false);
      expect(isFilePath("// ./file。ts")).toBe(false);
      expect(isFilePath("// ./file、test.ts")).toBe(false);
      expect(isFilePath("// ./file*.ts")).toBe(false);
      expect(isFilePath("// ./file?.ts")).toBe(false);
      expect(isFilePath("// ./file|.ts")).toBe(false);
    });
  });

  describe("extractPathFromLine", () => {
    it("should extract path correctly", () => {
      expect(extractPathFromLine("// ./file.ts")).toBe("file.ts");
      expect(extractPathFromLine("// ./src/file.ts")).toBe("src/file.ts");
      expect(extractPathFromLine("// ./path/to/file.js")).toBe("path/to/file.js");
      expect(extractPathFromLine("// ./test-file.ts")).toBe("test-file.ts");
      expect(extractPathFromLine("// ./snake_case_file.js")).toBe("snake_case_file.js");
    });

    it("should handle paths with special characters", () => {
      expect(extractPathFromLine("// ./.gitignore")).toBe(".gitignore");
      expect(extractPathFromLine("// ./src/.env")).toBe("src/.env");
      expect(extractPathFromLine("// ./src/file-with-dashes.ts")).toBe("src/file-with-dashes.ts");
    });
  });

  describe("toRelativePath", () => {
    it("should add './' prefix if missing", () => {
      expect(toRelativePath("file.ts")).toBe("./file.ts");
      expect(toRelativePath("src/file.ts")).toBe("./src/file.ts");
      expect(toRelativePath("path/to/file.js")).toBe("./path/to/file.js");
    });

    it("should not modify paths that already start with './'", () => {
      expect(toRelativePath("./file.ts")).toBe("./file.ts");
      expect(toRelativePath("./src/file.ts")).toBe("./src/file.ts");
      expect(toRelativePath("./.gitignore")).toBe("./.gitignore");
    });

    it("should handle paths with special characters", () => {
      expect(toRelativePath("-file.ts")).toBe("./-file.ts");
      expect(toRelativePath("_file.ts")).toBe("./_file.ts");
      expect(toRelativePath("file-with-dashes.ts")).toBe("./file-with-dashes.ts");
      expect(toRelativePath("snake_case_file.js")).toBe("./snake_case_file.js");
    });
  });
});
