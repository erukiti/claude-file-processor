/**
 * ログレベル
 */
export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE";

/**
 * ログコンテキスト
 */
export interface LogContext {
  /** モジュール名 */
  module: string;
  /** 関数名 */
  function: string;
  /** タイムスタンプ */
  timestamp: Date;
}

/**
 * ログオプション
 */
export interface LogOptions {
  /** ログレベル */
  level: LogLevel;
  /** フォーマット */
  format: string;
  /** 出力先 */
  destination: "console" | "file";
}

/**
 * ログレベルの数値マッピング
 */
const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

/**
 * 現在のログレベルの取得
 */
function getCurrentLogLevel(): LogLevel {
  const level = (process.env.LOG_LEVEL || "INFO").toUpperCase() as LogLevel;
  return LOG_LEVEL_MAP[level] !== undefined ? level : "INFO";
}

/**
 * ログメッセージの整形
 */
function formatLogMessage(level: LogLevel, message: string, context: Partial<LogContext> = {}): string {
  const timestamp = context.timestamp || new Date();
  const moduleInfo = context.module ? `[${context.module}]` : "";
  const functionInfo = context.function ? `[${context.function}]` : "";
  
  return `[${level}] [${timestamp.toISOString()}]${moduleInfo}${functionInfo} ${message}`;
}

/**
 * ログ出力の制御
 */
export function log(level: LogLevel, message: string, context: Partial<LogContext> = {}): void {
  const currentLevel = getCurrentLogLevel();
  if (LOG_LEVEL_MAP[level] <= LOG_LEVEL_MAP[currentLevel]) {
    const formattedMessage = formatLogMessage(level, message, context);
    console.log(formattedMessage);
  }
}

/**
 * エラーログ
 */
export function error(message: string, context: Partial<LogContext> = {}): void {
  log("ERROR", message, context);
}

/**
 * 警告ログ
 */
export function warn(message: string, context: Partial<LogContext> = {}): void {
  log("WARN", message, context);
}

/**
 * 情報ログ
 */
export function info(message: string, context: Partial<LogContext> = {}): void {
  log("INFO", message, context);
}

/**
 * デバッグログ
 */
export function debug(message: string, context: Partial<LogContext> = {}): void {
  log("DEBUG", message, context);
}

/**
 * トレースログ
 */
export function trace(message: string, context: Partial<LogContext> = {}): void {
  log("TRACE", message, context);
}
