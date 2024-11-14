import { describe, it, expect } from "vitest";
import { AppError, ParseError } from "./errors";

describe("errors", () => {
  describe("AppError", () => {
    it("should create AppError with context", () => {
      const error = new AppError("test error", {
        fileName: "test.ts",
        lineNumber: 1,
      });
      expect(error.name).toBe("AppError");
      expect(error.formatMessage()).toBe(
        "test error\n  at File: test.ts, Line: 1",
      );
    });

    it("should handle missing context", () => {
      const error = new AppError("test error");
      expect(error.formatMessage()).toBe("test error");
    });
  });

  describe("ParseError", () => {
    it("should create ParseError with line information", () => {
      const error = new ParseError("Parse failed", {
        lineNumber: 10,
        source: "invalid line",
        fileName: "test.ts",
      });
      expect(error.name).toBe("ParseError");
      expect(error.formatMessage()).toBe(
        "Parse failed\n  at File: test.ts, Line: 10\n  invalid line",
      );
    });
  });

  // その他のエラークラスのテストも同様に追加
});
