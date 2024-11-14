import type { FileContent } from "../types";
import { debugLog } from "./debug";
import { isFilePath, extractPathFromLine, toRelativePath } from "./path";
import { ParseError } from "./errors";

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
 * @throws ParseError パースに失敗した場合
 */
export const parseContent = (content: string): FileContent[] => {
  const files: FileContent[] = [];
  const lines = content.split("\n");
  let currentPath: string | null = null;
  let currentContent: string[] = [];
  let currentStartLine = 0;

  for (const [index, line] of lines.entries()) {
    try {
      if (isFilePath(line)) {
        if (currentPath && currentContent.length > 0) {
          files.push({
            path: currentPath,
            content: trimEmptyLines(currentContent.join("\n")),
          });
          currentContent = [];
        }
        currentPath = extractPathFromLine(line);
        currentStartLine = index + 1;
        debugLog(`Found file path at line ${index + 1}: ${currentPath}`);
      } else if (currentPath) {
        currentContent.push(line);
      } else if (line.trim() !== "" && !line.startsWith("//")) {
        // 空行でなく、コメント行でもなく、かつファイルパスの指定前の場合はエラー
        throw new ParseError("Content found before file path declaration", {
          lineNumber: index + 1,
          source: line,
        });
      }
    } catch (error) {
      if (error instanceof ParseError) {
        throw error;
      }
      throw new ParseError(
        error instanceof Error ? error.message : "Unknown parse error",
        {
          lineNumber: index + 1,
          source: line,
          fileName: currentPath ?? undefined,
        },
      );
    }
  }

  if (currentPath && currentContent.length > 0) {
    files.push({
      path: currentPath,
      content: trimEmptyLines(currentContent.join("\n")),
    });
  }

  if (files.length === 0) {
    throw new ParseError("No valid files found in content", {
      source: content.length > 100 ? `${content.slice(0, 100)}...` : content,
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

  // 各ファイルのブロックを生成
  const parts: string[] = [];
  for (const file of files) {
    const path = toRelativePath(file.path);
    const content = trimEmptyLines(file.content);
    parts.push(`// ${path}`); // ファイルパス
    parts.push(""); // 空行
    parts.push(content.slice(0, -1)); // 内容（末尾の改行を除去）
  }

  // すべてのパーツを改行で結合し、最後に改行を追加
  return `${parts.join("\n")}\n`;
};
