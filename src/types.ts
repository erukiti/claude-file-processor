/**
 * ファイル処理のオプション
 */
export interface ProcessOptions {
  /** dry-runモードを有効にするかどうか */
  dryRun: boolean;
  /** クリップボードを使用するかどうか */
  useClipboard: boolean;
  /** 出力先ディレクトリ（extract時） */
  outputDir?: string;
  /** 入力元ディレクトリ（pack時） */
  inputDir?: string;
}

/**
 * ファイルの内容を表す型
 */
export interface FileContent {
  /** ファイルパス */
  path: string;
  /** ファイルの中身 */
  content: string;
}
