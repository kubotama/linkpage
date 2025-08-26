import type { ApiErrorResponse } from "@/app/types/ApiResponse";

import { HTTP_STATUS_CONFLICT } from "../../constants/httpStatusCodes";

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
  return `${baseMessage}ステータス: ${status} ${statusText || ""}`.trimEnd();
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
    const errorMessage = "APIエラーレスポンスのボディ読み取りに失敗しました。";
    console.error(
      formatUserErrorMessage(
        errorMessage,
        response.status,
        e instanceof Error
          ? `エラーの種類: ${e.name}, メッセージ: ${e.message}`
          : `不明なエラー: ${String(e)}`
      ),
      e
    );
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
        message = json.message;
      } else {
        console.warn("APIエラーレスポンスのボディに message フィールドが含まれていないか、空です");
        message = formatUserErrorMessage(
          "APIから予期せぬ形式のエラーレスポンスを受け取りました。",
          response.status
        );
        cause = createErrorCauseFromContext({ body: bodyText, parsedJson: json });
      }
    } catch (e) {
      console.error("APIエラーレスポンスのボディをJSONとしてパースできませんでした。");
      message = formatUserErrorMessage(
        "APIからJSON形式でないエラーレスポンスを受け取りました。",
        response.status
      );
      cause = createErrorCauseFromContext({ error: e, body: bodyText });
    }
  }
  if (response.status === HTTP_STATUS_CONFLICT) {
    return new DuplicatedError(message, { cause });
  }
  return new ApiError(message, response.status, { cause });
};

export const getErrorMessage = (error: unknown, fallbackMessage?: string): string => {
  if (error instanceof ApiError) {
    return error.toString();
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (fallbackMessage) {
    return fallbackMessage;
  }
  return String(error ?? "不明なエラーが発生しました。");
};
