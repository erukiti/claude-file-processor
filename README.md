# File Processor

ファイルの内容を特定のフォーマットで結合・展開するツールです。

## 機能

- ファイルの内容を結合（pack）
- 結合されたファイルを展開（extract）
- クリップボード対応
- dry-run対応
- CLI対応

## インストール

```bash
npm install
```

必要な依存関係：
- commander: CLIインターフェース用
- clipboardy: クリップボード操作用
- globby: ファイル検索用
- TypeScript: 型システム
- vitest: テスト用

## 使い方

### ファイルの展開（extract）

結合されたファイルを個別のファイルに展開します。出力先ディレクトリの指定が必須です。

```bash
# 標準入力から読み込み、./outputに展開
npx tsx src/cli.ts extract ./output

# クリップボードから読み込み、./outputに展開
npx tsx src/cli.ts extract ./output --clipboard

# dry-runモード（実際のファイル書き込みを行わない）
npx tsx src/cli.ts extract ./output --dry-run
```

### ファイルの結合（pack）

指定したディレクトリ内のファイルを結合します。入力元ディレクトリの指定が必須です。

```bash
# ./srcのファイルを結合して標準出力に出力
npx tsx src/cli.ts pack ./src

# ./srcのファイルを結合してクリップボードに出力
npx tsx src/cli.ts pack ./src --clipboard

# dry-runモード
npx tsx src/cli.ts pack ./src --dry-run
```

## ファイルフォーマット

結合されたファイルは以下のフォーマットになります：

```
// ファイル1のパス

ファイル1の内容

// ファイル2のパス

ファイル2の内容
```

## 開発

### テストの実行

```bash
npm test
```

### ビルド

```bash
npm run build
```

## 制限事項

- 対象ファイルは `.ts` と `.js` のみ
- `node_modules` ディレクトリは除外される
- ファイル名の区切りとして使用される `// ` で始まる行は、ファイル内容として使用できない

## エラーハンドリング

以下の場合にエラーが発生します：

- ファイルの読み書きに失敗した場合
- 不正なフォーマットのファイルを展開しようとした場合
- 存在しないディレクトリを指定した場合

## デバッグ

処理中の詳細なログを確認したい場合は、コンソールに `[DEBUG]` プレフィックス付きのメッセージが出力されます。

## ライセンス

MIT

---

このツールに関する質問や問題がありましたら、Issueを作成してください。
