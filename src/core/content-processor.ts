import type { FileContent } from "../types";
import { parseContent, formatContent } from "../utils/processor-utils";
import { debugLog } from "../utils/debug";
import { info } from "../utils/logger";

/**
 * コンテンツ処理のオプション
 */
export interface ContentProcessOptions {
  /** ファイル検索パターン */
  filePattern?: string[];
  /** 除外パターン */
  ignorePattern?: string[];
}

/**
 * コンテンツの処理を行うクラス
 */
export class ContentProcessor {
  constructor(private readonly options: ContentProcessOptions = {}) {
    this.options = {
      filePattern: ["**/*.ts", "**/*.js"],
      ignorePattern: ["node_modules/**"],
      ...options,
    };
  }

  /**
   * コンテンツを解析してファイル情報に変換
   * @param content - 処理する文字列
   * @returns ファイル情報の配列
   */
  public parse(content: string): FileContent[] {
    debugLog("Starting content parsing", {
      module: "ContentProcessor",
      function: "parse",
    });

    const files = parseContent(content);

    files.forEach((file) => {
      info(`Parsed file: ${file.path}`, {
        module: "ContentProcessor",
        function: "parse",
      });
    });

    return files;
  }

  /**
   * ファイル情報をフォーマットされた文字列に変換
   * @param files - ファイル情報の配列
   * @returns フォーマットされた文字列
   */
  public format(files: FileContent[]): string {
    debugLog("Starting content formatting", {
      module: "ContentProcessor",
      function: "format",
    });

    files.forEach((file) => {
      info(`Formatting file: ${file.path}`, {
        module: "ContentProcessor",
        function: "format",
      });
    });

    return formatContent(files);
  }

  /**
   * ファイルパスが処理対象かどうかを判定
   * @param path - 判定するパス
   * @returns 処理対象の場合true
   */
  public isTargetFile(path: string): boolean {
    const { minimatch } = require("minimatch");
    const isMatch = (pattern: string) => minimatch(path, pattern);

    // 除外パターンに一致する場合は対象外
    if (this.options.ignorePattern?.some(isMatch)) {
      return false;
    }

    // ファイルパターンに一致する場合は対象
    return this.options.filePattern?.some(isMatch) ?? false;
  }
}
