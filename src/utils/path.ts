/**
 * ファイルパス行かどうかを判定する
 * @param line - 判定する行
 * @returns ファイルパス行の場合true
 */
export const isFilePath = (line: string): boolean => {
  // 行頭が "// ./" で始まり、かつファイル名っぽい文字列が続く場合のみtrue
  if (!line.startsWith("// ./")) return false;

  const path = line.slice(5).trim(); // "// ./" の分を除去
  // 明らかにファイルパスではないものを除外
  if (path.includes("(") || path.includes(")")) return false;
  if (path.includes("：")) return false; // 全角コロン
  if (path.includes("。")) return false; // 句点
  if (path.includes("、")) return false; // 読点

  // 一般的なファイル名パターンにマッチするかチェック
  return (
    /^[^<>:"|?*\n]+\.[a-zA-Z0-9]+$/.test(path) || // 拡張子がある
    path.includes("/") || // ディレクトリ構造がある
    /^[\w\-./]+$/.test(path)
  ); // 一般的なファイル名文字のみ
};

/**
 * ファイルパス行からパスを抽出する
 * @param line - ファイルパス行
 * @returns 抽出したパス
 */
export const extractPathFromLine = (line: string): string => {
  return line.slice(5).trim(); // "// ./" の分を除去
};

/**
 * パスを相対パス形式に変換する
 * @param path - 変換するパス
 * @returns 相対パス形式のパス
 */
export const toRelativePath = (path: string): string => {
  // すでに "./" で始まっている場合はそのまま返す
  if (path.startsWith("./")) {
    return path;
  }
  // それ以外の場合は "./" を付加
  return `./${path}`;
};
