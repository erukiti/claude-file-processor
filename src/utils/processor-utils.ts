import type { FileContent } from "../types";
import { debugLog } from "./debug";
import { isFilePath, extractPathFromLine, toRelativePath } from "./path";

/**
 * 文字列の前後の空行を削除する（末尾の改行は保持）
 * @param str - 処理する文字列
 * @returns トリムされた文字列（末尾に必ず1つの改行を含む）
 */
export const trimEmptyLines = (str: string): string => {
  // 前後の改行を全て削除し、末尾に必ず1つの改行を追加
  return `${str.replace(/^\n+/, "").replace(/\n+$/, "")}\n`;
};

/**
 * テキストをファイル内容の配列に変換する
 * @param content - 処理する文字列
 * @returns ファイル内容の配列
 */
export const parseContent = (content: string): FileContent[] => {
  const files: FileContent[] = [];
  const lines = content.split("\n");
  let currentPath: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    if (isFilePath(line)) {
      if (currentPath && currentContent.length > 0) {
        files.push({
          path: currentPath,
          content: trimEmptyLines(currentContent.join("\n")),
        });
        currentContent = [];
      }
      currentPath = extractPathFromLine(line);
    } else if (currentPath) {
      currentContent.push(line);
    }
  }

  if (currentPath && currentContent.length > 0) {
    files.push({
      path: currentPath,
      content: trimEmptyLines(currentContent.join("\n")),
    });
  }

  return files;
};

/**
 * ファイル内容の配列をテキストに変換する
 * @param files - ファイル内容の配列
 * @returns 変換されたテキスト（末尾に必ず1つの改行を含む）
 */
export const formatContent = (files: FileContent[]): string => {
  if (files.length === 0) return "\n";

  const formattedContent = files.map((file) => {
    const path = toRelativePath(file.path);
    const content = trimEmptyLines(file.content);
    // contentはすでに末尾の改行を含んでいる
    return `// ${path}\n\n${content}`;
  });

  // 各ファイルの内容を2つの改行で区切り、最後に改行を1つ追加
  return `${formattedContent.join("\n")}\n`;
};
