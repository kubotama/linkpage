export type Bookmark = {
  id: number;
  url: string;
  title: string;
};

export function createBookmark({
  id = 0,
  url = "",
  title = "",
}: Partial<Bookmark> = {}): Bookmark {
  return { id, url, title };
}

export function createBookmarkList(bookmarkList: Partial<Bookmark>[] = []) {
  return bookmarkList.map(createBookmark);
}
