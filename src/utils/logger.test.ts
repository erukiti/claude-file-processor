import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log, error, warn, info, debug, trace, type LogLevel } from "./logger";

describe("logger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env;
  const originalDate = global.Date;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log");
    vi.resetModules();
    process.env = { ...originalEnv };
    // 日付をモック化して一貫した値にする
    const mockDate = new Date("2024-01-01T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env = originalEnv;
    vi.useRealTimers();
  });

  describe("log", () => {
    it.each<LogLevel>(["ERROR", "WARN", "INFO", "DEBUG", "TRACE"])(
      "should output %s level message when level is sufficient",
      (level) => {
        process.env.LOG_LEVEL = level;
        const testMessage = "test message";
        const context = {
          module: "test",
          function: "testFunc",
          timestamp: new Date(),
        };

        log(level, testMessage, context);

        expect(consoleSpy).toHaveBeenCalledWith(
          `[${level}] [2024-01-01T00:00:00.000Z][test][testFunc] ${testMessage}`
        );
      }
    );

    it("should not output message when level is insufficient", () => {
      process.env.LOG_LEVEL = "ERROR";
      const testMessage = "test message";

      log("DEBUG", testMessage);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should use INFO as default log level", () => {
      // biome-ignore lint/performance/noDelete: テストのために必要
      delete process.env.LOG_LEVEL;
      const testMessage = "test message";

      log("INFO", testMessage);
      log("DEBUG", testMessage);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
    });

    it("should handle invalid log level gracefully", () => {
      process.env.LOG_LEVEL = "INVALID_LEVEL";
      const testMessage = "test message";

      log("INFO", testMessage);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
    });
  });

  describe("convenience methods", () => {
    beforeEach(() => {
      process.env.LOG_LEVEL = "TRACE";
    });

    it("should log error messages", () => {
      error("error message");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]")
      );
    });

    it("should log warning messages", () => {
      warn("warning message");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WARN]")
      );
    });

    it("should log info messages", () => {
      info("info message");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
    });

    it("should log debug messages", () => {
      debug("debug message");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[DEBUG]")
      );
    });

    it("should log trace messages", () => {
      trace("trace message");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[TRACE]")
      );
    });
  });
});
