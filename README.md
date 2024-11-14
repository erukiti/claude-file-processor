# File Processor

ChatGPT/Claudeなどのサービスで吐き出した特定のフォーマットのファイルの展開および、そのフォーマットに結合するツールです。

## 機能

- ファイルの内容を結合（pack）
- 結合されたファイルを展開（extract）
- クリップボード対応
- dry-run対応
- CLI対応

## 依存パッケージのインストール

```bash
bun i
```

## コンパイル

bunを使って1バイナリにコンパイルできます。

```bash
bun compile
```

dist/cfpにバイナリが出力されます。

## 使い方

### ファイルの展開（extract）

結合されたファイルを個別のファイルに展開します。出力先ディレクトリの指定が必須です。

```bash
# 標準入力から読み込み、./outputに展開
bun src/cli.ts extract ./output

# クリップボードから読み込み、./outputに展開
bun src/cli.ts extract ./output --clipboard

# dry-runモード（実際のファイル書き込みを行わない）
bun src/cli.ts extract ./output --dry-run
```

### ファイルの結合（pack）

指定したディレクトリ内のファイルを結合します。入力元ディレクトリの指定が必須です。

```bash
# ./srcのファイルを結合して標準出力に出力
bun src/cli.ts pack ./src

# ./srcのファイルを結合してクリップボードに出力
bun src/cli.ts pack ./src --clipboard

# dry-runモード
bun src/cli.ts pack ./src --dry-run
```

## ファイルフォーマット

結合されたファイルは以下のフォーマットになります：

```
// ./file1

file1の内容

// ./file2

file2の内容
```

`// ./` で始まる相対パスのみをファイルとして認識します。

## 開発

### テストの実行

```bash
bun test
```

### ビルド

```bash
bun build
```

## デバッグ

処理中の詳細なログを確認したい場合は、コンソールに `[DEBUG]` プレフィックス付きのメッセージが出力されます。

## ライセンス

MIT
