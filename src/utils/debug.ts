import type { LogContext } from "./logger";

/**
 * デバッグログを出力する関数
 * @param message - 出力するメッセージ
 * @param context - ログコンテキスト
 */
export const debugLog = (message: string, context: Partial<LogContext> = {}): void => {
  // debugLogは以前の動作を維持する必要がある
  if (process.env.DEBUG === "1") {
    console.log(`[DEBUG] ${message}`);
  }
};
