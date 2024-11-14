import type { ErrorContext } from "./errors";
import { AppError, type LogContext } from "./errors";
import { error as logError, warn, info } from "./logger";

/**
 * エラー処理の結果
 */
export interface ErrorResult {
  /** 終了コード */
  exitCode: number;
  /** エラーメッセージ */
  message: string;
  /** ログレベル */
  logLevel: "error" | "warn" | "info";
}

/**
 * エラーハンドラーの設定オプション
 */
export interface ErrorHandlerOptions {
  /** 終了時にプロセスを終了するかどうか */
  exitOnError?: boolean;
  /** ログコンテキスト */
  logContext?: Partial<LogContext>;
}

/**
 * エラーを処理し、適切な結果を返す
 * @param error - 処理するエラー
 * @param options - エラーハンドラーのオプション
 * @returns エラー処理の結果
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): ErrorResult {
  const { exitOnError = true, logContext = {} } = options;

  let result: ErrorResult;

  if (error instanceof AppError) {
    // アプリケーション固有のエラー
    result = {
      exitCode: getExitCodeForError(error),
      message: error.formatMessage(),
      logLevel: "error",
    };
  } else if (error instanceof Error) {
    // 標準的なエラー
    result = {
      exitCode: 1,
      message: `Unexpected error: ${error.message}`,
      logLevel: "error",
    };
  } else {
    // 未知のエラー
    result = {
      exitCode: 1,
      message: "Unknown error occurred",
      logLevel: "error",
    };
  }

  // ログ出力
  const context = {
    ...logContext,
    error: error instanceof Error ? error : undefined,
  };

  switch (result.logLevel) {
    case "error":
      logError(result.message, context);
      break;
    case "warn":
      warn(result.message, context);
      break;
    case "info":
      info(result.message, context);
      break;
  }

  // プロセスの終了
  if (exitOnError) {
    process.exit(result.exitCode);
  }

  return result;
}

/**
 * エラータイプに応じた終了コードを取得
 * @param error - アプリケーションエラー
 * @returns 終了コード
 */
function getExitCodeForError(error: AppError): number {
  switch (error.constructor.name) {
    case "ValidationError":
      return 64; // EX_USAGE
    case "SecurityError":
      return 77; // EX_NOPERM
    case "FileOperationError":
      return 73; // EX_CANTCREAT
    case "ParseError":
      return 65; // EX_DATAERR
    default:
      return 1;
  }
}
