import { Command } from "commander";
import { extract, pack } from "./core/processor";
import clipboard from "clipboardy";
import { debugLog } from "./utils/debug";
import type { ProcessOptions } from "./types";
import { mkdir } from "node:fs/promises";
import { AppError } from "./utils/errors";

const program = new Command()
  .name("cfp")
  .description("A utility for packing and extracting files")
  .version("1.0.0");

program
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
        outputDir,
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
        debugLog("Reading from stdin");
        content = "";
        process.stdin.setEncoding("utf-8");
        for await (const chunk of process.stdin) {
          content += chunk;
        }
      }

      const files = await extract(content, options);
      console.log(`Processed ${files.length} files to ${outputDir}`);
    } catch (error) {
      if (error instanceof AppError) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      } else if (error instanceof Error) {
        console.error("Unexpected error:", error.message);
        process.exit(1);
      } else {
        console.error("Unknown error occurred");
        process.exit(1);
      }
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
        inputDir,
      };

      const result = await pack(inputDir, options);
      if (!options.useClipboard) {
        console.log(result);
      } else {
        console.log("Content has been copied to clipboard");
      }
    } catch (error) {
      if (error instanceof AppError) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      } else if (error instanceof Error) {
        console.error("Unexpected error:", error.message);
        process.exit(1);
      } else {
        console.error("Unknown error occurred");
        process.exit(1);
      }
    }
  });

program.parse();
