import type { FileContent } from '../types';
import { debugLog } from './debug';
import { isFilePath, extractPathFromLine } from './path';

/**
 * 文字列の前後の空行を削除する
 * @param str - 処理する文字列
 * @returns トリムされた文字列
 */
export const trimEmptyLines = (str: string): string => {
  return str.replace(/^\n+|\n+$/g, '');
};

/**
 * テキストをファイル内容の配列に変換する
 * @param content - 処理する文字列
 * @returns ファイル内容の配列
 */
export const parseContent = (content: string): FileContent[] => {
  const files: FileContent[] = [];
  const lines = content.split('\n');
  let currentPath: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    if (isFilePath(line)) {
      if (currentPath && currentContent.length > 0) {
        files.push({
          path: currentPath,
          content: trimEmptyLines(currentContent.join('\n')),
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
      content: trimEmptyLines(currentContent.join('\n')),
    });
  }

  return files;
};

/**
 * ファイル内容の配列をテキストに変換する
 * @param files - ファイル内容の配列
 * @returns 変換されたテキスト
 */
export const formatContent = (files: FileContent[]): string => {
  return files.map(file => `// ${file.path}\n\n${trimEmptyLines(file.content)}`).join('\n\n');
};