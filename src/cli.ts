import { Command } from "commander";
import { extract, pack } from "./core/processor";
import clipboard from "clipboardy";
import { debugLog } from "./utils/debug";
import type { ProcessOptions } from "./types";
import { mkdir } from "node:fs/promises";

const program = new Command();

program
  .version("1.0.0")
  .option("-d, --dry-run", "Perform a dry run")
  .option("-c, --clipboard", "Use clipboard for input/output");

program
  .command("extract <outputDir>")
  .description("Extract files to specified directory")
  .action(async (outputDir: string) => {
    try {
      const options: ProcessOptions = {
        dryRun: program.opts().dryRun ?? false,
        useClipboard: program.opts().clipboard ?? false,
        outputDir, // 出力先ディレクトリを追加
      };

      // 出力先ディレクトリの作成
      if (!options.dryRun) {
        await mkdir(outputDir, { recursive: true });
      }

      let content: string;
      if (options.useClipboard) {
        debugLog("Reading from clipboard");
        content = await clipboard.read();
      } else {
        // 標準入力から読み込み
        content = "";
        process.stdin.setEncoding("utf-8");
        for await (const chunk of process.stdin) {
          content += chunk;
        }
      }

      const files = await extract(content, options);
      console.log(`Processed ${files.length} files to ${outputDir}`);
    } catch (error) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : "Unknown error",
      );
      process.exit(1);
    }
  });

program
  .command("pack <inputDir>")
  .description("Pack files from input directory")
  .action(async (inputDir: string) => {
    try {
      const options: ProcessOptions = {
        dryRun: program.opts().dryRun ?? false,
        useClipboard: program.opts().clipboard ?? false,
        inputDir, // 入力元ディレクトリを追加
      };

      const result = await pack(inputDir, options);
      if (!options.useClipboard) {
        console.log(result);
      }
    } catch (error) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : "Unknown error",
      );
      process.exit(1);
    }
  });

program.parse();
