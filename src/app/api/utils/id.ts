export class InvalidIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidIdError";
  }
}

export const getId = (params: { id: string }): number => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new InvalidIdError("IDは正の整数である必要があります。");
  }
  return id;
};

export const getIdAsync = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<number> => {
  return getId(await params);
};
