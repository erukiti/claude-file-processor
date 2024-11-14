import { resolve } from "node:path";
import { readFileContent, writeFileContent } from "../utils/file";
import { debugLog } from "../utils/debug";
import { parseContent, formatContent } from "../utils/processor-utils";
import type { FileContent, ProcessOptions } from "../types";
import { ValidationError, SecurityError } from "../utils/errors";
import { checkPathSecurity } from "../utils/security";
import clipboard from "clipboardy";
import { error, info } from "../utils/logger";

/**
 * ファイルを展開する関数
 * @param content - 処理する文字列
 * @param options - 処理オプション
 * @returns 展開されたファイルの配列
 * @throws ValidationError 出力先ディレクトリが指定されていない場合
 * @throws SecurityError パスのセキュリティチェックに失敗した場合
 */
export const extract = async (
  content: string,
  options: ProcessOptions,
): Promise<FileContent[]> => {
  if (!options.outputDir) {
    throw new ValidationError("Output directory must be specified");
  }

  debugLog("Starting extraction process", { module: "processor", function: "extract" });
  const files = parseContent(content);

  if (!options.dryRun) {
    for (const file of files) {
      const fullPath = resolve(options.outputDir, file.path);
      
      // セキュリティチェック
      await checkPathSecurity(fullPath, options.outputDir);
      
      debugLog(`Writing file: ${fullPath}`, { 
        module: "processor",
        function: "extract",
        timestamp: new Date()
      });
      
      await writeFileContent(fullPath, file.content);
      info(`Extracted: ${file.path}`, {
        module: "processor",
        function: "extract"
      });
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
 * @throws SecurityError パスのセキュリティチェックに失敗した場合
 */
export const pack = async (
  directory: string,
  options: ProcessOptions,
): Promise<string> => {
  const { inputDir } = options;
  if (!inputDir) {
    throw new ValidationError("Input directory must be specified");
  }

  debugLog(`Starting pack process for directory: ${directory}`, {
    module: "processor",
    function: "pack"
  });

  const { globby } = await import("globby");
  const paths = await globby(["**/*.ts", "**/*.js"], {
    cwd: directory,
    ignore: ["node_modules/**"],
  });

  const files: FileContent[] = await Promise.all(
    paths.map(async (path) => {
      const fullPath = resolve(inputDir, path);
      
      // セキュリティチェック
      await checkPathSecurity(fullPath, inputDir);
      
      debugLog(`Reading file: ${fullPath}`, {
        module: "processor",
        function: "pack"
      });
      
      const content = await readFileContent(fullPath);
      info(`Packed: ${path}`, {
        module: "processor",
        function: "pack"
      });
      
      return { path, content };
    }),
  );

  const result = formatContent(files);

  if (!options.dryRun && options.useClipboard) {
    debugLog("Copying result to clipboard", {
      module: "processor",
      function: "pack"
    });
    await clipboard.write(result);
  }

  return result;
};
