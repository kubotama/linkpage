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

const handleBodyReadError = (e: unknown): { message: string; cause: unknown } => {
  const errorMessage = `APIエラーレスポンスのボディ読み取りに失敗しました。${
    e instanceof Error ? `エラーの種類: ${e.name}, メッセージ: ${e.message}` : "原因不明"
  }`;
  console.error(errorMessage, e);
  return { message: errorMessage, cause: e };
};

/**
 * APIからのエラーレスポンスを解析し、ApiErrorオブジェクトを生成します。
 * この関数は、`response.ok`が`false`であるようなエラーレスポンスを処理することを想定しています。
 * @param response - fetchからのResponseオブジェクト
 * @returns ApiErrorオブジェクトを含むPromise
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let message = `リクエストに失敗しました。ステータス: ${response.status} ${response.statusText}`;
  let cause: unknown;
  let bodyText: string | null;

  try {
    bodyText = await response.text();
  } catch (e) {
    // ボディの読み取り自体に失敗した場合。
    const errorResult = handleBodyReadError(e);
    return new ApiError(errorResult.message, response.status, { cause: errorResult.cause });
  }

  // ボディがある場合はJSONパースを試みる
  try {
    const json: ApiErrorResponse = JSON.parse(bodyText);
    if (!json || typeof json.message !== "string" || !json.message.trim()) {
      console.warn(
        "APIエラーレスポンスのボディに message フィールドが含まれていないか、空です",
        json
      );
      // JSONはあるがmessageが含まれていないか、空なので、ボディ全体をメッセージとする
      message = bodyText;
    } else {
      message = json.message;
    }
  } catch (e) {
    console.warn(
      "APIエラーレスポンスのボディをJSONとしてパースできませんでした。",
      e,
      "ボディ:",
      bodyText
    );
    cause = e;
    // JSONパース失敗時、ボディが空でなければそれをメッセージとする
    if (bodyText) {
      message = bodyText;
    }
  }

  return new ApiError(message, response.status, { cause });
};
