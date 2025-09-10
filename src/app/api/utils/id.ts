export class InvalidIdError extends Error {
  constructor(message: string = "IDは正の整数である必要があります。") {
    super(message);
    this.name = "InvalidIdError";
  }
}

export class InvalidBookmarkError extends InvalidIdError {
  constructor(bookmarkId: string | undefined) {
    super(`無効なブックマークIDです: ${bookmarkId ?? "undefined"}`);
    this.name = "InvalidBookmarkError";
  }
}

export class InvalidKeywordError extends InvalidIdError {
  constructor(keywordId: string | undefined) {
    super(`無効なキーワードIDです: ${keywordId ?? "undefined"}`);
    this.name = "InvalidKeywordError";
  }
}

export const getId = (params: { id: string }): number => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new InvalidIdError();
  }
  return id;
};

const getIdAsync = async <T extends InvalidIdError>(
  paramsPromise: Promise<{ [key: string]: string }>,
  key: string,
  ErrorClass: new (id: string | undefined) => T
): Promise<number> => {
  let idValue: string | undefined;
  try {
    const params = await paramsPromise;
    idValue = params[key];
    if (idValue === undefined) {
      throw new ErrorClass(idValue);
    }
    return getId({ id: idValue });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      throw new ErrorClass(idValue);
    }
    throw error;
  }
};

export const getBookmarkIdAsync = async ({
  params,
}: {
  params: Promise<{ bookmark_id: string }>;
}): Promise<number> => {
  return getIdAsync(params, "bookmark_id", InvalidBookmarkError);
};

export const getKeywordIdAsync = async ({
  params,
}: {
  params: Promise<{ keyword_id: string }>;
}): Promise<number> => {
  return getIdAsync(params, "keyword_id", InvalidKeywordError);
};
