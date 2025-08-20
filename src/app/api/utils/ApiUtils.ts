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

/**
 * APIからのエラーレスポンスを解析し、ApiErrorオブジェクトを生成します。
 * この関数は、`response.ok`が`false`であるようなエラーレスポンスを処理することを想定しています。
 * @param response - fetchからのResponseオブジェクト
 * @returns ApiErrorオブジェクトを含むPromise
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let message = `リクエストに失敗しました。ステータス: ${response.status} ${response.statusText}`;
  let cause: unknown;
  try {
    const json: ApiErrorResponse = await response.json();
    if (json && typeof json.message === "string") {
      message = json.message;
    } else {
      // messageフィールドがない場合も警告ログを出力
      console.warn("APIエラーレスポンスのボディに message フィールドが含まれていません。", json);
    }
  } catch (e: unknown) {
    cause = e;
    // JSONのパースに失敗した場合でもエラーとして扱えるように、
    // ステータスコードに基づいたフォールバックメッセージを使用します。
    console.error("APIエラーレスポンスボディのJSONパースに失敗しました。", e);
  }

  return new ApiError(message, response.status, { cause });
};
