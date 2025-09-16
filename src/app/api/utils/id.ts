export class InvalidIdError extends Error {
  invalidId: string | undefined;
  constructor(
    invalidId: string | undefined,
    message: string = "IDは正の整数である必要があります。"
  ) {
    super(message);
    this.name = "InvalidIdError";
    this.invalidId = invalidId;
  }
}

export class InvalidBookmarkError extends InvalidIdError {
  constructor(bookmarkId: string | undefined) {
    super(bookmarkId, `無効なブックマークIDです: ${bookmarkId ?? "undefined"}`);
    this.name = "InvalidBookmarkError";
  }
}

export class InvalidKeywordError extends InvalidIdError {
  constructor(keywordId: string | undefined) {
    super(keywordId, `無効なキーワードIDです: ${keywordId ?? "undefined"}`);
    this.name = "InvalidKeywordError";
  }
}

export class NotExistBookmarkError extends Error {
  constructor() {
    super("ブックマークが指定されていません。");
    this.name = "NotExistBookmarkError";
  }
}

export class NotExistKeywordError extends Error {
  constructor() {
    super("キーワードが指定されていません。");
    this.name = "NotExistKeywordError";
  }
}

export const getId = (params: { id: string }): number => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new InvalidIdError(params.id, `無効なIDです: ${params.id}`);
  }
  return id;
};

const getIdAsync = async <T extends Error>(
  paramsPromise: Promise<{ [key: string]: string }>,
  key: string,
  NotExistErrorClass: new () => T,
  InvalidIdErrorClass: new (id: string | undefined) => T
): Promise<number> => {
  let idValue: string | undefined;
  try {
    const params = await paramsPromise;
    idValue = params[key];
    if (idValue === undefined) {
      throw new NotExistErrorClass();
    }
    return getId({ id: idValue });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      throw new InvalidIdErrorClass(idValue);
    }
    throw error;
  }
};

export const getBookmarkIdAsync = async ({
  params,
}: {
  params: Promise<{ bookmark_id?: string }>;
}): Promise<number> => {
  return getIdAsync(params, "bookmark_id", NotExistBookmarkError, InvalidBookmarkError);
};

export const getKeywordIdAsync = async ({
  params,
}: {
  params: Promise<{ keyword_id?: string }>;
}): Promise<number> => {
  return getIdAsync(params, "keyword_id", NotExistKeywordError, InvalidKeywordError);
};
