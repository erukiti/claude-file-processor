import type { FileContent, ProcessOptions } from "../types";
import { ContentProcessor } from "./content-processor";
import { FileProcessor } from "./file-processor";

/**
 * ファイルを展開する関数
 * @param content - 処理する文字列
 * @param options - 処理オプション
 * @returns 展開されたファイルの配列
 */
export const extract = async (
  content: string,
  options: ProcessOptions
): Promise<FileContent[]> => {
  const contentProcessor = new ContentProcessor();
  const fileProcessor = new FileProcessor(contentProcessor, options);
  return fileProcessor.extract(content);
};

/**
 * ファイルをパックする関数
 * @param directory - 処理するディレクトリ
 * @param options - 処理オプション
 * @returns パックされたファイルの文字列
 */
export const pack = async (
  directory: string,
  options: ProcessOptions
): Promise<string> => {
  const contentProcessor = new ContentProcessor();
  const fileProcessor = new FileProcessor(contentProcessor, options);
  return fileProcessor.pack(directory);
};
