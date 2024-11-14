/**
 * エラーコンテキスト情報
 */
export interface ErrorContext {
  /** ファイル名 */
  fileName?: string;
  /** 行番号 */
  lineNumber?: number;
  /** カラム番号 */
  columnNumber?: number;
  /** ソースコード */
  source?: string;
}

/**
 * アプリケーションの基本エラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly context: ErrorContext = {}
  ) {
    super(message);
    this.name = "AppError";
  }

  /**
   * エラーメッセージを整形する
   */
  formatMessage(): string {
    const contextInfo = [];
    if (this.context.fileName) {
      contextInfo.push(`File: ${this.context.fileName}`);
    }
    if (this.context.lineNumber) {
      contextInfo.push(`Line: ${this.context.lineNumber}`);
    }
    if (this.context.columnNumber) {
      contextInfo.push(`Column: ${this.context.columnNumber}`);
    }

    let message = this.message;
    if (contextInfo.length > 0) {
      message = `${message}\n  at ${contextInfo.join(", ")}`;
    }
    if (this.context.source) {
      message = `${message}\n  ${this.context.source}`;
    }
    return message;
  }
}

/**
 * ファイル操作に関するエラークラス
 */
export class FileOperationError extends AppError {
  constructor(message: string, public readonly path: string, context: ErrorContext = {}) {
    super(`File operation failed at ${path}: ${message}`, context);
    this.name = "FileOperationError";
  }
}

/**
 * バリデーションエラークラス
 */
export class ValidationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, context);
    this.name = "ValidationError";
  }
}

/**
 * パースエラークラス
 */
export class ParseError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, context);
    this.name = "ParseError";
  }
}

/**
 * セキュリティエラークラス
 */
export class SecurityError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, context);
    this.name = "SecurityError";
  }
}
