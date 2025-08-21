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

  const bodyText = await response.text().catch((e) => {
    // ボディの読み取り自体に失敗した場合。デフォルトメッセージが使用される。
    const errorResult = handleBodyReadError(e);
    cause = errorResult.cause;
    message = errorResult.message;
    return null;
  });

  if (bodyText) {
    try {
      const json: ApiErrorResponse = JSON.parse(bodyText);
      if (json && typeof json.message === "string") {
        message = json.message;
      } else {
        console.warn("APIエラーレスポンスのボディに message フィールドが含まれていません。", json);
        message = bodyText;
      }
    } catch (e) {
      cause = e;
      message = bodyText;
    }
  }

  return new ApiError(message, response.status, { cause });
};
