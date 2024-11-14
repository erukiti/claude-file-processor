import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { FileOperationError } from './errors';

/**
 * ファイルを読み込む関数
 * @param filePath - 読み込むファイルのパス
 * @returns ファイルの内容
 * @throws FileOperationError ファイルの読み込みに失敗した場合
 */
export const readFileContent = async (filePath: string): Promise<string> => {
  try {
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    throw new FileOperationError(
      error instanceof Error ? error.message : 'Unknown error',
      filePath
    );
  }
};

/**
 * ファイルを書き込む関数
 * @param filePath - 書き込み先のファイルパス
 * @param content - 書き込む内容
 * @throws FileOperationError ファイルの書き込みに失敗した場合
 */
export const writeFileContent = async (filePath: string, content: string): Promise<void> => {
  try {
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new FileOperationError(
      error instanceof Error ? error.message : 'Unknown error',
      filePath
    );
  }
};