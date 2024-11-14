# 設計ドキュメント

## 概要
このツールは、複数のTypeScriptやJavaScriptファイルを特定のフォーマットで結合・展開するためのCLIツールです。

## アーキテクチャ
### レイヤー構造
1. CLIレイヤー (cli.ts)
   - コマンドライン引数の解析
   - 入出力の制御
2. コアレイヤー (core/processor.ts)
   - ファイル処理のメインロジック
3. ユーティリティレイヤー (utils/*)
   - 共通機能の提供

### セキュリティ
1. パスの検証
   - ディレクトリトラバーサル攻撃の防止
     - パスの正規化
     - 親ディレクトリへの移動（../）の検出と防止
   - シンボリックリンクの検出と適切な処理
     - リンクの解決とループの防止
     - 最大解決深度の設定

2. 入力検証
   - ファイルパスのサニタイズ
   - 不正な文字の検出
   - パス長の制限

### エラー処理
1. エラー種別の拡張
   - ParseError: パース関連のエラー
     - 行番号情報
     - コンテキスト情報
   - SecurityError: セキュリティ関連のエラー
     - 不正なパスの検出
     - 権限の問題
   - ValidationError: 入力検証エラー
   - FileOperationError: ファイル操作エラー

2. エラーコンテキスト
   - 発生場所（ファイル名、行番号）
   - エラーの詳細情報
   - 推奨される対処方法

### ロギング
1. ログレベル
   - ERROR: エラー情報
   - WARN: 警告情報
   - INFO: 一般的な情報
   - DEBUG: デバッグ情報
   - TRACE: 詳細なトレース情報

2. ログフォーマット
   ```
   [LEVEL] [TIMESTAMP] [CONTEXT] Message
   ```

3. ログ出力制御
   - 環境変数による制御
     - DEBUG: デバッグログの有効化
     - LOG_LEVEL: ログレベルの設定
     - LOG_FORMAT: フォーマットの設定

## データフロー

### セキュリティチェックフロー
1. パス正規化
2. セキュリティチェック
   - ディレクトリトラバーサルの検出
   - シンボリックリンクの解決
3. パスのサニタイズ
4. エラー報告（必要な場合）

### エラー処理フロー
1. エラーの検出
2. コンテキスト情報の収集
3. エラーインスタンスの生成
4. エラーのログ記録
5. 適切なエラーメッセージの表示

### ログ処理フロー
1. ログレベルの確認
2. コンテキスト情報の収集
3. フォーマットの適用
4. 出力

## 実装の詳細

### セキュリティ実装
```typescript
interface SecurityCheckOptions {
  allowSymlinks: boolean;
  maxSymlinkDepth: number;
  allowedPaths: string[];
}

interface SecurityCheckResult {
  isValid: boolean;
  normalizedPath: string;
  errors: string[];
}
```

### エラー実装
```typescript
interface ErrorContext {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  source?: string;
}

class DetailedError extends Error {
  context: ErrorContext;
  suggestions: string[];
}
```

### ログ実装
```typescript
type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE";

interface LogContext {
  module: string;
  function: string;
  timestamp: Date;
}

interface LogOptions {
  level: LogLevel;
  format: string;
  destination: "console" | "file";
}
```

## テスト戦略

### セキュリティテスト
- ディレクトリトラバーサル攻撃の検出
- シンボリックリンクの処理
- パスのサニタイズ

### エラー処理テスト
- 各種エラーケースの検証
- エラーメッセージの正確性
- コンテキスト情報の正確性

### ログテスト
- 各ログレベルの動作
- フォーマットの正確性
- 環境変数による制御

## 設定項目
```typescript
interface Config {
  security: {
    allowSymlinks: boolean;
    maxSymlinkDepth: number;
    allowedPaths: string[];
  };
  logging: {
    level: LogLevel;
    format: string;
    destination: string;
  };
  errors: {
    showLineNumbers: boolean;
    showSuggestions: boolean;
  };
}
```
