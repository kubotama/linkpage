import type { ApiErrorResponse } from "@/app/types/ApiResponse";

import { HTTP_STATUS_CONFLICT } from "../../constants/httpStatusCodes";

export const ERROR_MESSAGE_NOT_EXIST_OR_EMPTY =
  "APIエラーレスポンスのボディに message フィールドが含まれていないか、空です";
export const ERROR_MESSAGE_PARSE_JSON =
  "APIエラーレスポンスのボディをJSONとしてパースできませんでした。";
export const ERROR_UNEXPECTED_RESPONSE_FORMAT =
  "APIから予期せぬ形式のエラーレスポンスを受け取りました。";
export const ERROR_MESSAGE_READ_RESPONSE_BODY = `APIエラーレスポンスのボディ読み取りに失敗しました。`;
/**
 * APIエラーを表すカスタムエラークラス。
 * @param message - エラーメッセージ（フォーマット前）
 * @param status - HTTPステータスコード
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number, options?: { cause: unknown }) {
    // 親クラスのErrorには、元のメッセージをそのまま渡す
    super(message, options);
    this.name = "ApiError";
    this.status = status;
  }

  // エラーオブジェクトが文字列として評価される際に、ステータスコードを含む形式にする
  public toString(): string {
    return `${this.name}: [${this.status}] ${this.message}`;
  }

  /**
   * エラーオブジェクトをJSONにシリアライズする際に使用されるメソッド。
   * @returns シリアライズ可能なエラー情報オブジェクト
   */
  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
    };
  }
}

export class DuplicatedError extends ApiError {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, HTTP_STATUS_CONFLICT, options);
    this.name = "DuplicatedError";
  }
}

const createErrorCauseFromContext = (logContext: object): Error => {
  const replacer = (_key: string, value: unknown) => {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    return value;
  };
  return new Error(JSON.stringify(logContext, replacer));
};

const formatUserErrorMessage = (
  baseMessage: string,
  status: number,
  statusText?: string
): string => {
  // ユーザー向けのエラーメッセージにHTTPステータスを付与する
  return `${baseMessage} ステータス: ${status} ${statusText || ""}`.trimEnd();
};

/**
 * APIからのエラーレスポンスを解析し、ApiErrorオブジェクトを生成します。
 * この関数は、`response.ok`が`false`であるようなエラーレスポンスを処理することを想定しています。
 * @param response - fetchからのResponseオブジェクト
 * @returns ApiErrorオブジェクトを含むPromise
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let message = formatUserErrorMessage(
    "リクエストに失敗しました。",
    response.status,
    response.statusText
  );
  let cause: Error | undefined;
  let bodyText = "";

  try {
    bodyText = await response.text();
  } catch (e) {
    const errorMessage = ERROR_MESSAGE_READ_RESPONSE_BODY;
    const errorDetails =
      e instanceof Error
        ? `エラーの種類: ${e.name}, メッセージ: ${e.message}`
        : `不明なエラー: ${String(e)}`;
    console.error(`${errorMessage} ステータス: ${response.status}. ${errorDetails}`, e);
    return new ApiError(
      formatUserErrorMessage(errorMessage, response.status, response.statusText),
      response.status,
      {
        cause: e,
      }
    );
  }

  if (bodyText) {
    try {
      const json: ApiErrorResponse = JSON.parse(bodyText);
      if (typeof json?.message === "string" && json.message.trim()) {
        message = json.message.trim();
      } else {
        console.warn(`${ERROR_MESSAGE_NOT_EXIST_OR_EMPTY} ステータス: ${response.status}`);
        message = formatUserErrorMessage(
          ERROR_UNEXPECTED_RESPONSE_FORMAT,
          response.status,
          response.statusText
        );
        cause = createErrorCauseFromContext({ body: bodyText, parsedJson: json });
      }
    } catch (e) {
      console.error(`${ERROR_MESSAGE_PARSE_JSON} ステータス: ${response.status}`, e);
      message = formatUserErrorMessage(
        ERROR_MESSAGE_PARSE_JSON,
        response.status,
        response.statusText
      );
      cause = e instanceof Error ? e : new Error(String(e));
    }
  }
  if (response.status === HTTP_STATUS_CONFLICT) {
    return new DuplicatedError(message, { cause });
  }
  return new ApiError(message, response.status, { cause });
};

/**
 * エラーオブジェクトからユーザーフレンドリーなエラーメッセージを抽出します。
 * @param error - 解析対象のエラーオブジェクト (unknown型)
 * @param fallbackMessage - エラーからメッセージを抽出できなかった場合の代替メッセージ
 * @param isLog - trueの場合、ログ用の詳細なメッセージ（ステータスコード等を含む）を返す。falseの場合はUI表示用の簡潔なメッセージを返す。
 * @returns エラーメッセージ文字列
 */
export const getErrorMessage = (
  error: unknown,
  fallbackMessage?: string,
  isLog: boolean = true
): string => {
  // ログ出力時はステータスコード等を含む詳細なメッセージを返す
  if (error instanceof ApiError && isLog) {
    return error.toString();
  }

  // Errorインスタンスからメッセージを抽出し、空でなければ返す
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  // Errorインスタンスでない、またはメッセージが空の場合は、
  // フォールバックメッセージがあればそれを返す。
  // なければ最終的なフォールバックメッセージを返す。
  if (fallbackMessage) {
    return fallbackMessage;
  }

  // 最終的なフォールバック
  return "不明なエラーが発生しました。";
};
