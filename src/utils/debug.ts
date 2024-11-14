/**
 * デバッグログを出力する関数
 * @param message - 出力するメッセージ
 */
export const debugLog = (message: string): void => {
  if (process.env.DEBUG === "1") {
    console.log(`[DEBUG] ${message}`);
  }
};
