import { digits_2, digits_3, digits_4, digits_5, freedial, isMobileIPLists, navidial } from "../allTelStartDigits";

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
 * beginDigit：先頭の桁数, 
 * middleDigit：中間の桁数, 
 * noHyphenSumTelStr：入力文字数（ハイフンなしの電話番号文字列の合計）
*/
const _adjustShapePhoneNumber: (telnumStr: string, beginDigit: number, middleDigit: number, noHyphenSumTelStr: number) => string = (
  telnumStr: string,
  beginDigit: number,
  middleDigit: number,
  noHyphenSumTelStr: number
) => {
  return `${telnumStr.slice(0, beginDigit)}-${telnumStr.slice(beginDigit, (beginDigit + middleDigit))}-${telnumStr.slice((beginDigit + middleDigit), noHyphenSumTelStr)}`;
}

/**
 * 市外局番がイレギュラーなパターンの場合 （例：関東圏には{04-xxxx-xxxx}, {042~9-xxx-xxxx}という桁数は同じでもハイフン区切りが異なる）の処理
 * checkDigit：チェックする際の桁数分類, 
 * targetAreaType：対象となるエリアまたは種別, 
 * specificPhoneNum：当該市外局番（例：'04'）, 
 * telnumStr：電話番号文字列
*/
const _specificPhoneNumber: (checkDigit: string, targetAreaType: string, specificPhoneNum: string, telnumStr: string) => string | undefined = (
  checkDigit: string,
  targetAreaType: string,
  specificPhoneNum: string,
  telnumStr: string
) => {
  /* true：市外局番2桁, false：ナビダイヤル */
  const checkAndSelectPhoneNumber: boolean = checkDigit.length === 2 ? telnumStr.length > 7 : telnumStr.length > 9;
  const d3 = checkDigit.length === 2 ? _adjustShapePhoneNumber(telnumStr, 3, 3, 10) : _adjustShapePhoneNumber(telnumStr, 4, 3, 10);
  const d2 = checkDigit.length === 2 ? _adjustShapePhoneNumber(telnumStr, 2, 4, 10) : _adjustShapePhoneNumber(telnumStr, 4, 2, 10);

  if (checkDigit === specificPhoneNum && checkAndSelectPhoneNumber) {
    const result = confirm(`${targetAreaType}の市外局番{${specificPhoneNum}}には以下の表記が存在します。今回はどちらに該当しますか？\n{${d3}}の場合は「OK」を、\n{${d2}}の場合は「キャンセル」を選択してください。`);

    if (result) return d3;
    else return d2;
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
      if (checkDigit_4 === '0570') {
        /* ナビダイヤルには {0570-xx-xxxx}, {0570-xxx-xxx} のパターンがある */
        const navidial_specificPhoneNumber: string | undefined = _specificPhoneNumber(checkDigit_4, 'ナビダイヤル', '0570', restoreFormattedNumber);
        if (typeof navidial_specificPhoneNumber !== 'undefined') {
          return formattedNumber = navidial_specificPhoneNumber;
        }
      } else {
        /* フリーダイヤル */
        const is_0800: boolean = checkDigit_4 === '0800' && restoreFormattedNumber.length >= 11;
        if (is_0800) {
          return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, 4, 3, 11);
        }

        const is_0120: boolean = checkDigit_4 === '0120' && restoreFormattedNumber.length >= 10;
        if (is_0120) {
          return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, 4, 3, 10);
        }
      }
    }

    /* モバイル・IP */
    const checkDigit_3: string = _checkDigitsClassification(restoreFormattedNumber, 3);
    const isMobileIP: boolean = isMobileIPLists.includes(checkDigit_3) && restoreFormattedNumber.length >= 11;
    if (!isNaviOrFreedial && isMobileIP) {
      return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, 3, 4, 11);
    }

    /* 市外局番 */
    if (!isNaviOrFreedial && restoreFormattedNumber.length >= 6) {
      /* 先頭 5 桁 */
      const checkDigit_5: string = _checkDigitsClassification(restoreFormattedNumber, 5);
      const digit_5: boolean = digits_5.includes(checkDigit_5);
      if (digit_5) {
        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, 5, 1, 10);
      }

      /* 先頭 4 桁 */
      const digit_4: boolean = digits_4.includes(checkDigit_4);
      if (digit_4) {
        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, 4, 2, 10);
      }

      /* 先頭 3 桁 */
      const notMobileDigit_3: boolean = digits_3.includes(checkDigit_3);
      if (notMobileDigit_3) {
        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, 3, 3, 10);
      }

      /* 先頭 2 桁 */
      const checkDigit_2: string = _checkDigitsClassification(restoreFormattedNumber, 2);
      const digit_2: boolean = digits_2.includes(checkDigit_2);
      if (digit_2) {
        /* 市外局番がイレギュラーな関東圏の場合 */
        const kantoArea_specificPhoneNumber: string | undefined = _specificPhoneNumber(checkDigit_2, '関東圏', '04', restoreFormattedNumber);
        if (typeof kantoArea_specificPhoneNumber !== 'undefined') {
          return formattedNumber = kantoArea_specificPhoneNumber;
        }

        return formattedNumber = _adjustShapePhoneNumber(restoreFormattedNumber, 2, 4, 10);
      }
    }

    return formattedNumber;
  }

  return { adjustPhoneNumber }
}