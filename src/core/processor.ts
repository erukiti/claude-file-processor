import { resolve } from "node:path";
import { readFileContent, writeFileContent } from "../utils/file";
import { debugLog } from "../utils/debug";
import type { FileContent, ProcessOptions } from "../types";
import clipboard from "clipboardy";

/**
 * 文字列の前後の空行を削除する
 * @param str - 処理する文字列
 * @returns トリムされた文字列
 */
const trimEmptyLines = (str: string): string => {
  return str.replace(/^\n+|\n+$/g, "");
};

/**
 * ファイルパス行かどうかを判定する
 * @param line - 判定する行
 * @returns ファイルパス行の場合true
 */
const isFilePath = (line: string): boolean => {
  // 行頭が "// " で始まり、かつファイル名っぽい文字列が続く場合のみtrue
  if (!line.startsWith("// ")) return false;

  const path = line.slice(3).trim();
  // 明らかにファイルパスではないものを除外
  if (path.includes("(") || path.includes(")")) return false;
  if (path.includes("：")) return false; // 全角コロン
  if (path.includes("。")) return false; // 句点
  if (path.includes("、")) return false; // 読点

  // 一般的なファイル名パターンにマッチするかチェック
  // - 拡張子があるか
  // - パスセパレータ（/）を含むか
  // - 一般的なファイル名パターン（英数字、ハイフン、アンダースコア、ドット）で構成されているか
  return (
    /^[^<>:"|?*\n]+\.[a-zA-Z0-9]+$/.test(path) || // 拡張子がある
    path.includes("/") || // ディレクトリ構造がある
    /^[\w\-./]+$/.test(path)
  ); // 一般的なファイル名文字のみ
};

/**
 * ファイルを展開する関数
 * @param content - 処理する文字列
 * @param options - 処理オプション
 * @returns 展開されたファイルの配列
 * @throws 出力先ディレクトリが指定されていない場合
 */
export const extract = async (
  content: string,
  options: ProcessOptions,
): Promise<FileContent[]> => {
  if (!options.outputDir) {
    throw new Error("Output directory must be specified");
  }

  debugLog("Starting extraction process");
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
      currentPath = line.slice(3).trim();
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
 * @throws 入力元ディレクトリが指定されていない場合
 */
export const pack = async (
  directory: string,
  options: ProcessOptions,
): Promise<string> => {
  if (!options.inputDir) {
    throw new Error("Input directory must be specified");
  }

  debugLog(`Starting pack process for directory: ${directory}`);
  const { globby } = await import("globby");
  const paths = await globby(["**/*.ts", "**/*.js"], {
    cwd: directory,
    ignore: ["node_modules/**"],
  });

  const contents: string[] = [];
  for (const path of paths) {
    const fullPath = resolve(options.inputDir, path);
    const content = await readFileContent(fullPath);
    contents.push(`// ${path}\n\n${trimEmptyLines(content)}`);
  }

  const result = contents.join("\n\n");

  if (!options.dryRun && options.useClipboard) {
    debugLog("Copying result to clipboard");
    await clipboard.write(result);
  }

  return result;
};
