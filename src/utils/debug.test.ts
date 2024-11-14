import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debugLog } from "./debug";

describe("debug utils", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log");
    // Node.jsのprocess.envをモック化
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env = originalEnv;
  });

  it("should output debug message when DEBUG=1", () => {
    process.env.DEBUG = "1";
    const testMessage = "test message";

    debugLog(testMessage);

    expect(consoleSpy).toHaveBeenCalledWith("[DEBUG] test message");
  });

  it("should not output debug message when DEBUG is not set", () => {
    delete process.env.DEBUG;
    const testMessage = "test message";

    debugLog(testMessage);

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should not output debug message when DEBUG=0", () => {
    process.env.DEBUG = "0";
    const testMessage = "test message";

    debugLog(testMessage);

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
