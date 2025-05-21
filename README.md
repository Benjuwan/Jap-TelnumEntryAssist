## Jap-TelnumEntryAssist
- [デモプレイ：CodeSandbox](https://codesandbox.io/embed/fkv682?view=preview)

## 概要
日本での電話番号入力を補助（自動的にハイフン区切り）するものです。数値（電話番号）を入力した際に適切な位置にハイフンが挿入されます。（※ハイフンありで入力した場合は入力補助機能は余計な働きをしません）<br>

`React`, `TypeScript`で作成していますが、カスタムフック（`src\form\hooks\useAdjustPhoneNumber.ts`）に切り分けているので（`TypeScript`の型注釈を省くと）純粋な関数・メソッドとしてバニラJSでも活用できると思います（※試してはいないので悪しからず）。

### 備考
関東圏の市外局番（`04`）やナビダイヤル（`0570`）には電話番号の桁数が同じでも **ハイフン区切り位置が異なるものが存在** します。その場合、入力途中でどちらの区切り方が正しいかを選択する確認ダイアログが表示され、その選択結果が反映されます。<br>

ちなみに、`allTelStartDigits.ts`で **関東圏（'042', '043', '044', '045', '046', '047', '048', '049'）の市外局番を一括除外している理由** は、各市外局番の（電話番号10桁内における先頭数文字の）重複範囲が広すぎるため（各市外局番ごとの個別関数処理が現実的ではないと判断し）一挙に省いて、先頭2桁{04}で`_specificPhoneNumber`メソッドを通じて電話番号を整形しています。

## コンポーネント
- `src\form\Form.tsx`<br>
フォームのコンポーネントです。便宜上`react-hook-form`を使っていますが、機能には特に関りありません。

- `src\form\allTelStartDigits.ts`<br>
日本国内各地の市外局番やフリーダイヤル・ナビダイヤル、IP、携帯電話などの先頭部分を網羅した電話番号管理用ファイルです。
  - 電話番号のデータ参照：[電話番号検索 | IVRy（アイブリー）](https://ivry.jp/telsearch/)

- `src\form\hooks\useAdjustPhoneNumber.ts`<br>
入力補助を担うカスタムフック（関数・メソッド）です。

## 技術構成
- @eslint/js@9.27.0
- @tailwindcss/vite@4.1.7
- @types/react-dom@18.3.7
- @types/react@18.3.21
- @vitejs/plugin-react-swc@3.9.0
- eslint-plugin-react-hooks@5.2.0
- eslint-plugin-react-refresh@0.4.20
- eslint@9.27.0
- globals@15.15.0
- react-dom@18.3.1
- react-hook-form@7.56.4
- react@18.3.1
- tailwindcss@4.1.7
- typescript-eslint@8.32.1
- typescript@5.8.3
- vite@6.3.5
