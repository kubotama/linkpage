export class InvalidIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidIdError";
  }
}

export const getId = (params: { id: string }): number => {
  const bookmark_id = Number(params.id);
  if (!Number.isInteger(bookmark_id) || bookmark_id <= 0) {
    throw new InvalidIdError("IDは正の整数である必要があります。");
  }
  return bookmark_id;
};

export const getBookmarkIdAsync = async ({
  params,
}: {
  params: Promise<{ bookmark_id: string }>;
}): Promise<number> => {
  return getId({ id: (await params).bookmark_id });
};

export const getKeywordIdAsync = async ({
  params,
}: {
  params: Promise<{ keyword_id: string }>;
}): Promise<number> => {
  return getId({ id: (await params).keyword_id });
};
