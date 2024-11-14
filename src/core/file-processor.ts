import { resolve } from "node:path";
import type { FileContent, ProcessOptions } from "../types";
import { readFileContent, writeFileContent } from "../utils/file";
import { debugLog } from "../utils/debug";
import { checkPathSecurity } from "../utils/security";
import { ValidationError } from "../utils/errors";
import { info } from "../utils/logger";
import clipboard from "clipboardy";
import type { ContentProcessor } from "./content-processor";
import { globby } from "globby";

/**
 * ファイル処理を行うクラス
 */
export class FileProcessor {
  constructor(
    private readonly contentProcessor: ContentProcessor,
    private readonly options: ProcessOptions
  ) {}

  /**
   * ファイルを展開する
   * @param content - 処理する文字列
   * @returns 展開されたファイルの配列
   */
  public async extract(content: string): Promise<FileContent[]> {
    if (!this.options.outputDir) {
      throw new ValidationError("Output directory must be specified");
    }

    debugLog("Starting extraction process", {
      module: "FileProcessor",
      function: "extract",
    });

    const files = this.contentProcessor.parse(content);

    if (!this.options.dryRun) {
      for (const file of files) {
        const fullPath = resolve(this.options.outputDir, file.path);
        await checkPathSecurity(fullPath, this.options.outputDir);
        
        debugLog(`Writing file: ${fullPath}`, {
          module: "FileProcessor",
          function: "extract",
        });
        
        await writeFileContent(fullPath, file.content);
        info(`Extracted: ${file.path}`, {
          module: "FileProcessor",
          function: "extract",
        });
      }
    }

    return files;
  }

  /**
   * ファイルをパックする
   * @param directory - 処理するディレクトリ
   * @returns パックされたファイルの文字列
   */
  public async pack(directory: string): Promise<string> {
    if (!this.options.inputDir) {
      throw new ValidationError("Input directory must be specified");
    }

    debugLog(`Starting pack process for directory: ${directory}`, {
      module: "FileProcessor",
      function: "pack",
    });

    const paths = await globby(["**/*.ts", "**/*.js"], {
      cwd: directory,
      ignore: ["node_modules/**"],
    });

    const files: FileContent[] = await Promise.all(
      paths
        .filter((path) => this.contentProcessor.isTargetFile(path))
        .map(async (path) => {
          const fullPath = resolve(this.options.inputDir!, path);
          await checkPathSecurity(fullPath, this.options.inputDir!);
          
          debugLog(`Reading file: ${fullPath}`, {
            module: "FileProcessor",
            function: "pack",
          });
          
          const content = await readFileContent(fullPath);
          info(`Packed: ${path}`, {
            module: "FileProcessor",
            function: "pack",
          });
          
          return { path, content };
        })
    );

    const result = this.contentProcessor.format(files);

    if (!this.options.dryRun && this.options.useClipboard) {
      debugLog("Copying result to clipboard", {
        module: "FileProcessor",
        function: "pack",
      });
      await clipboard.write(result);
    }

    return result;
  }
}
