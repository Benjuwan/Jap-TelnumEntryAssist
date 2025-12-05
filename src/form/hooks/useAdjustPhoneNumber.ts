import { digits_2, digits_3, digits_4, digits_5, freedial, isMobileIPLists, navidial } from "../allTelStartDigits";

type adjustShapePhoneNumber_position = {
  beginDigit: number; // 先頭の桁数
  middleDigit: number; // 中間の桁数
  noHyphenSumTelStr: number; // 入力文字数（ハイフンなしの電話番号文字列の合計）
};

/* 各電話番号別の分類（桁数のチェックと分類）*/
const _checkDigitsClassification: (telStr: string, delimitPoint: number) => string = (
  telStr: string,
  delimitPoint: number
) => {
  return telStr.slice(0, delimitPoint);
}

/**
 * 各電話番号の仕様に応じた電話番号（文字列）の整形
 * telnumStr：電話番号文字列, 
 * position： adjustShapePhoneNumber_position
*/
const _adjustShapePhoneNumber: (telnumStr: string, position: adjustShapePhoneNumber_position) => string = (
  telnumStr: string,
  position: adjustShapePhoneNumber_position
) => {
  return `${telnumStr.slice(0, position.beginDigit)}-${telnumStr.slice(position.beginDigit, (position.beginDigit + position.middleDigit))}-${telnumStr.slice((position.beginDigit + position.middleDigit), position.noHyphenSumTelStr)}`;
}

/**
 * 市外局番がイレギュラーなパターンの場合 （例：関東圏には{04-xxxx-xxxx}, {042~9-xxx-xxxx}という桁数は同じでもハイフン区切りが異なる）の処理
 * checkDigit：チェックする際の桁数分類, 
 * targetAreaType：対象となるエリアまたは種別, 
 * specificPhoneNum：当該市外局番（例：'04'）, 
 * telnumStr：電話番号文字列,
 * truePosition: adjustShapePhoneNumber_position,
 * falsePosition: adjustShapePhoneNumber_position,
 * checkLineByEntryLength: 確認ダイアログ表示判定のしきい値（入力文字数）
*/
const _specificPhoneNumber = (
  checkDigit: string,
  targetAreaType: string,
  specificPhoneNum: string | string[],
  telnumStr: string,
  truePosition: adjustShapePhoneNumber_position,
  falsePosition: adjustShapePhoneNumber_position,
  checkLineByEntryLength: number
): string | undefined => {
  const checkAndSelectPhoneNumber: boolean = telnumStr.length > checkLineByEntryLength;

  const pattern_true = _adjustShapePhoneNumber(telnumStr, truePosition);
  const pattern_false = _adjustShapePhoneNumber(telnumStr, falsePosition);

  const isAry_specificPhoneNum: boolean = Array.isArray(specificPhoneNum);
  const isAlertOn: boolean = isAry_specificPhoneNum ? specificPhoneNum.includes(checkDigit) : checkDigit === specificPhoneNum;

  if (isAlertOn && checkAndSelectPhoneNumber) {
    const result = confirm(`${targetAreaType}の市外局番{${specificPhoneNum}}には以下の表記が存在します。今回はどちらに該当しますか？\n{${pattern_true}}の場合は「OK」を、\n{${pattern_false}}の場合は「キャンセル」を選択してください。`);

    if (result) return pattern_true;
    else return pattern_false;
  }
}

/* ---------------------------- カスタムフック本体 ---------------------------- */
export const useAdjustPhoneNumber = () => {
  const adjustPhoneNumber: (telValue: string) => string = (telValue: string) => {
    let formattedNumber: string = telValue.trim();

    /* 既に整形済みかつ12文字以下の場合は入力内容を返す */
    if (formattedNumber.includes('-') && telValue.length < 12) return formattedNumber;

    /* 電話番号を適切にハンドリングするために整形済みの文字列を元に戻す（復元）*/
    const restoreFormattedNumber: string = formattedNumber.replaceAll('-', '');

    /* フリーダイヤル・ナビダイヤル（※{0800}がモバイル{080}処理になるのを回避するため先に書いておく）*/
    const checkDigit_4: string = _checkDigitsClassification(restoreFormattedNumber, 4);
    const isNaviOrFreedial: boolean = [...freedial, ...navidial].includes(checkDigit_4);

    if (isNaviOrFreedial) {
      const multiPaternDial: string[] = ['0120', '0570'];

      if (multiPaternDial.includes(checkDigit_4)) {
        /* {DDDD-xx-xxxx}, {DDDD-xxx-xxx} のパターンがある */
        const truePosition: adjustShapePhoneNumber_position = { beginDigit: 4, middleDigit: 3, noHyphenSumTelStr: 10 };
        const falsePosition: adjustShapePhoneNumber_position = { beginDigit: 4, middleDigit: 2, noHyphenSumTelStr: 10 };
        const navidial_specificPhoneNumber: string | undefined = _specificPhoneNumber(checkDigit_4, 'ナビダイヤル', multiPaternDial, restoreFormattedNumber, truePosition, falsePosition, 9);
        if (typeof navidial_specificPhoneNumber !== 'undefined') {
          return formattedNumber = navidial_specificPhoneNumber;
        }
      } else {
        /* フリーダイヤル */
        const is_0800: boolean = checkDigit_4 === '0800' && restoreFormattedNumber.length >= 11;
        if (is_0800) {
          const position: adjustShapePhoneNumber_position = { beginDigit: 4, middleDigit: 3, noHyphenSumTelStr: 11 };
          return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, position);
        }
      }
    }

    /* モバイル・IP */
    const checkDigit_3: string = _checkDigitsClassification(restoreFormattedNumber, 3);
    const isMobileIP: boolean = isMobileIPLists.includes(checkDigit_3) && restoreFormattedNumber.length >= 11;
    if (!isNaviOrFreedial && isMobileIP) {
      const position: adjustShapePhoneNumber_position = { beginDigit: 3, middleDigit: 4, noHyphenSumTelStr: 11 };
      return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, position);
    }

    /* 市外局番 */
    if (!isNaviOrFreedial && restoreFormattedNumber.length >= 6) {
      /* 先頭 5 桁 */
      const checkDigit_5: string = _checkDigitsClassification(restoreFormattedNumber, 5);
      const digit_5: boolean = digits_5.includes(checkDigit_5);
      if (digit_5) {
        const position: adjustShapePhoneNumber_position = { beginDigit: 5, middleDigit: 1, noHyphenSumTelStr: 10 };
        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, position);
      }

      /* 先頭 4 桁 */
      const digit_4: boolean = digits_4.includes(checkDigit_4);
      if (digit_4) {
        /* 宮城県{0223}の場合 */
        const truePosition: adjustShapePhoneNumber_position = { beginDigit: 3, middleDigit: 3, noHyphenSumTelStr: 10 };
        const falsePosition: adjustShapePhoneNumber_position = { beginDigit: 4, middleDigit: 2, noHyphenSumTelStr: 10 };
        const miyagiPref_specificPhoneNumber: string | undefined = _specificPhoneNumber(checkDigit_4, '宮城県', '0223', restoreFormattedNumber, truePosition, falsePosition, 7);
        if (typeof miyagiPref_specificPhoneNumber !== 'undefined') {
          return formattedNumber = miyagiPref_specificPhoneNumber;
        }

        const position: adjustShapePhoneNumber_position = { beginDigit: 4, middleDigit: 2, noHyphenSumTelStr: 10 };
        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, position);
      }

      /* 先頭 3 桁 */
      const notMobileDigit_3: boolean = digits_3.includes(checkDigit_3);
      if (notMobileDigit_3) {
        const position: adjustShapePhoneNumber_position = { beginDigit: 3, middleDigit: 3, noHyphenSumTelStr: 10 };
        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, position);
      }

      /* 先頭 2 桁 */
      const checkDigit_2: string = _checkDigitsClassification(restoreFormattedNumber, 2);
      const digit_2: boolean = digits_2.includes(checkDigit_2);
      if (digit_2) {
        /* 関東圏{04}の場合 */
        const truePosition: adjustShapePhoneNumber_position = { beginDigit: 3, middleDigit: 3, noHyphenSumTelStr: 10 };
        const falsePosition: adjustShapePhoneNumber_position = { beginDigit: 2, middleDigit: 4, noHyphenSumTelStr: 10 };
        const kantoArea_specificPhoneNumber: string | undefined = _specificPhoneNumber(checkDigit_2, '関東圏', '04', restoreFormattedNumber, truePosition, falsePosition, 7);
        if (typeof kantoArea_specificPhoneNumber !== 'undefined') {
          return formattedNumber = kantoArea_specificPhoneNumber;
        }

        const position: adjustShapePhoneNumber_position = { beginDigit: 2, middleDigit: 4, noHyphenSumTelStr: 10 };
        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, position);
      }
    }

    return formattedNumber;
  }

  return { adjustPhoneNumber }
}
