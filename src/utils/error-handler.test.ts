import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleError } from "./error-handler";
import { AppError, ValidationError, SecurityError } from "./errors";
import * as logger from "./logger";

describe("error-handler", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(logger, "error").mockImplementation(() => undefined);
    vi.spyOn(logger, "warn").mockImplementation(() => undefined);
    vi.spyOn(logger, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle AppError correctly", () => {
    const error = new ValidationError("Invalid input");
    const result = handleError(error, { exitOnError: false });

    expect(result.exitCode).toBe(64);
    expect(result.message).toBe("Invalid input");
    expect(result.logLevel).toBe("error");
    expect(logger.error).toHaveBeenCalledWith("Invalid input", expect.any(Object));
  });

  it("should handle standard Error", () => {
    const error = new Error("Standard error");
    const result = handleError(error, { exitOnError: false });

    expect(result.exitCode).toBe(1);
    expect(result.message).toBe("Unexpected error: Standard error");
    expect(result.logLevel).toBe("error");
  });

  it("should handle unknown error", () => {
    const error = "string error";
    const result = handleError(error, { exitOnError: false });

    expect(result.exitCode).toBe(1);
    expect(result.message).toBe("Unknown error occurred");
    expect(result.logLevel).toBe("error");
  });

  it("should include log context", () => {
    const error = new SecurityError("Security violation");
    const context = { module: "test", function: "testFunc" };
    
    handleError(error, { 
      exitOnError: false,
      logContext: context
    });

    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining(context)
    );
  });

  it("should exit process when exitOnError is true", () => {
    const error = new ValidationError("Invalid input");
    handleError(error);
    expect(process.exit).toHaveBeenCalledWith(64);
  });

  it("should return correct exit codes for different error types", () => {
    const testCases = [
      { error: new ValidationError("test"), expectedCode: 64 },
      { error: new SecurityError("test"), expectedCode: 77 },
      { error: new AppError("test"), expectedCode: 1 },
    ];

    for (const { error, expectedCode } of testCases) {
      const result = handleError(error, { exitOnError: false });
      expect(result.exitCode).toBe(expectedCode);
    }
  });
});
