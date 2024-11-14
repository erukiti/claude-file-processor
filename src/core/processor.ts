import { resolve } from "node:path";
import { readFileContent, writeFileContent } from "../utils/file";
import { debugLog } from "../utils/debug";
import { parseContent, formatContent } from "../utils/processor-utils";
import type { FileContent, ProcessOptions } from "../types";
import { ValidationError } from "../utils/errors";
import clipboard from "clipboardy";

/**
 * ファイルを展開する関数
 * @param content - 処理する文字列
 * @param options - 処理オプション
 * @returns 展開されたファイルの配列
 * @throws ValidationError 出力先ディレクトリが指定されていない場合
 */
export const extract = async (
  content: string,
  options: ProcessOptions,
): Promise<FileContent[]> => {
  if (!options.outputDir) {
    throw new ValidationError("Output directory must be specified");
  }

  debugLog("Starting extraction process");
  const files = parseContent(content);

  if (!options.dryRun) {
    for (const file of files) {
      const fullPath = resolve(options.outputDir, file.path);
      debugLog(`Writing file: ${fullPath}`);
      await writeFileContent(fullPath, file.content);
    }
  }

  return files;
};

/**
 * ファイルをパックする関数
 * @param directory - 処理するディレクトリ
 * @param options - 処理オプション
 * @returns パックされたファイルの文字列
 * @throws ValidationError 入力元ディレクトリが指定されていない場合
 */
export const pack = async (
  directory: string,
  options: ProcessOptions,
): Promise<string> => {
  const { inputDir } = options;
  if (!inputDir) {
    throw new ValidationError("Input directory must be specified");
  }

  debugLog(`Starting pack process for directory: ${directory}`);
  const { globby } = await import("globby");
  const paths = await globby(["**/*.ts", "**/*.js"], {
    cwd: directory,
    ignore: ["node_modules/**"],
  });

  const files: FileContent[] = await Promise.all(
    paths.map(async (path) => {
      const fullPath = resolve(inputDir, path);
      const content = await readFileContent(fullPath);
      return { path, content };
    }),
  );

  const result = formatContent(files);

  if (!options.dryRun && options.useClipboard) {
    debugLog("Copying result to clipboard");
    await clipboard.write(result);
  }

  return result;
};
