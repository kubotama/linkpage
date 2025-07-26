export const validateId = (id: string): number => {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    // 呼び出し側でエラーレスポンスを生成するため、ここでは汎用的なエラーをスローします。
    throw new Error("ID must be a positive integer.");
  }
  return numId;
};
