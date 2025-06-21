export type Bookmark = {
  id: number;
  url: string;
  title: string;
};

export function createBookmark({
  id = 0,
  url = "",
  title = "",
}: Partial<Bookmark>): Bookmark {
  return { id, url, title };
}

export function createBookmarkList(bookmarkList: Partial<Bookmark>[]) {
  return bookmarkList.map(createBookmark);
}

export const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    id: 1,
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    id: 2,
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    id: 3,
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    id: 4,
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

export type SelectedBookmark = Bookmark | null;
