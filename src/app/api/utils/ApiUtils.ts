import type { ApiErrorResponse } from "@/app/types/ApiResponse";

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
    return `ApiError: [${this.status}] ${this.message}`;
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

const createErrorCauseFromContext = (logContext: object): Error => {
  return logContext instanceof Error ? logContext : new Error(JSON.stringify(logContext));
};

const formatUserErrorMessage = (baseMessage: string, status: number): string => {
  // ユーザー向けのエラーメッセージにHTTPステータスを付与する
  return `${baseMessage}ステータス: ${status}`;
};

/**
 * APIからのエラーレスポンスを解析し、ApiErrorオブジェクトを生成します。
 * この関数は、`response.ok`が`false`であるようなエラーレスポンスを処理することを想定しています。
 * @param response - fetchからのResponseオブジェクト
 * @returns ApiErrorオブジェクトを含むPromise
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let message = `リクエストに失敗しました。ステータス: ${response.status} ${response.statusText}`;
  let cause: Error | undefined;
  let bodyText = "";

  try {
    bodyText = await response.text();
  } catch (e) {
    // ボディの読み取り自体に失敗した場合。
    const errorMessage = `APIエラーレスポンスのボディ読み取りに失敗しました。${
      e instanceof Error
        ? `エラーの種類: ${e.name}, メッセージ: ${e.message}`
        : `不明なエラー: ${String(e)}`
    }`;
    console.error(errorMessage, e);
    return new ApiError(errorMessage, response.status, { cause: e });
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
  return new ApiError(message, response.status, { cause });
};
