/**
 * アプリケーションの基本エラークラス
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * ファイル操作に関するエラークラス
 */
export class FileOperationError extends AppError {
  constructor(
    message: string,
    public readonly path: string,
  ) {
    super(`File operation failed at ${path}: ${message}`);
    this.name = "FileOperationError";
  }
}

/**
 * バリデーションエラークラス
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
