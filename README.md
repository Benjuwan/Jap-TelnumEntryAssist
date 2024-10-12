## Jap-TelnumEntryAssist

[デモプレイ：CodeSandbox](https://codesandbox.io/embed/fkv682?view=preview)

## 概要
日本での電話番号入力を補助（自動的にハイフン区切り）するものです。数値（電話番号）を入力した際に適切な位置にハイフンが挿入されます。（※ハイフンありで入力した場合は入力補助機能は余計な働きをしません）<br>`React`, `TypeScript`で作成していますが、カスタムフック（`src\form\hooks\useAdjustPhoneNumber.ts`）に切り分けているので（`TypeScript`の型注釈を省くと）純粋な関数・メソッドとしてバニラJSでも活用できると思います（※試してはいないので悪しからず）。

### 備考
関東圏の市外局番（`04`）やナビダイヤル（`0570`）には電話番号の桁数が同じでも **ハイフン区切り位置が異なるものが存在** します。その場合、入力途中でどちらの区切り方が正しいかを選択する確認ダイアログが表示され、その選択結果が反映されます。

## コンポーネント
- `src\form\Form.tsx`<br>
フォームのコンポーネントです。便宜上`react-hook-form`を使っていますが、機能には特に関りありません。

- `src\form\allTelStartDigits.ts`<br>
日本国内各地の市外局番やフリーダイヤル・ナビダイヤル、IP、携帯電話などの先頭部分を網羅した電話番号管理用ファイルです。
  - 電話番号のデータ参照：[電話番号検索 | IVRy（アイブリー）](https://ivry.jp/telsearch/)

- `src\form\hooks\useAdjustPhoneNumber.ts`<br>
入力補助を担うカスタムフック（関数・メソッド）です。

## 技術構成
- @eslint/js@9.12.0
- @types/react-dom@18.3.1
- @types/react@18.3.11
- @vitejs/plugin-react-swc@3.7.1
- eslint-plugin-react-hooks@5.1.0-rc-fb9a90fa48-20240614
- eslint-plugin-react-refresh@0.4.12
- eslint@9.12.0
- globals@15.11.0
- react-dom@18.3.1
- react-hook-form@7.53.0
- react@18.3.1
- styled-components@6.1.13
- typescript-eslint@8.8.1
- typescript@5.6.3
- vite@5.4.8
