import { resolve, normalize, isAbsolute, relative } from "node:path";
import { lstat } from "node:fs/promises";
import { SecurityError } from "./errors";
import { debugLog } from "./debug";

/**
 * セキュリティチェックのオプション
 */
export interface SecurityCheckOptions {
  /** シンボリックリンクを許可するか */
  allowSymlinks: boolean;
  /** シンボリックリンクの最大解決深度 */
  maxSymlinkDepth: number;
  /** 許可されたパスのリスト */
  allowedPaths: string[];
}

/**
 * パスのセキュリティチェック結果
 */
export interface SecurityCheckResult {
  /** 有効なパスかどうか */
  isValid: boolean;
  /** 正規化されたパス */
  normalizedPath: string;
  /** エラーメッセージのリスト */
  errors: string[];
}

/**
 * デフォルトのセキュリティチェックオプション
 */
const DEFAULT_SECURITY_OPTIONS: SecurityCheckOptions = {
  allowSymlinks: false,
  maxSymlinkDepth: 10,
  allowedPaths: [],
};

/**
 * パスのセキュリティチェックを行う
 * @param path - チェックするパス
 * @param basePath - ベースパス
 * @param options - セキュリティチェックオプション
 * @returns セキュリティチェック結果
 * @throws SecurityError セキュリティチェックに失敗した場合
 */
export async function checkPathSecurity(
  path: string,
  basePath: string,
  options: Partial<SecurityCheckOptions> = {}
): Promise<SecurityCheckResult> {
  const opt = { ...DEFAULT_SECURITY_OPTIONS, ...options };
  const errors: string[] = [];
  const normalizedPath = normalize(path);

  debugLog(`Checking security for path: ${path}`);
  debugLog(`Normalized path: ${normalizedPath}`);

  // ディレクトリトラバーサルのチェック
  const resolvedPath = resolve(basePath, normalizedPath);
  const relativePath = relative(basePath, resolvedPath);
  if (relativePath.startsWith("..")) {
    throw new SecurityError("Directory traversal detected", {
      fileName: path,
    });
  }

  // シンボリックリンクのチェック
  if (!opt.allowSymlinks) {
    try {
      const stat = await lstat(resolvedPath);
      if (stat.isSymbolicLink()) {
        throw new SecurityError("Symlinks are not allowed", {
          fileName: path,
        });
      }
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      // ファイルが存在しない場合は無視
      debugLog(`File not found: ${resolvedPath}`);
    }
  }

  return {
    isValid: errors.length === 0,
    normalizedPath: normalizedPath,
    errors,
  };
}
