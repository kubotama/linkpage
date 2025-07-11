export type Bookmark = {
  bookmark_id: number;
  url: string;
  title: string;
};

export function createBookmark({
  bookmark_id = 0,
  url = "",
  title = "",
}: Partial<Bookmark>): Bookmark {
  return { bookmark_id, url, title };
}

export function createBookmarkList(bookmarkList: Partial<Bookmark>[]) {
  return bookmarkList.map(createBookmark);
}

export const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    bookmark_id: 1,
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    bookmark_id: 2,
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    bookmark_id: 3,
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    bookmark_id: 4,
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

export type SelectedBookmarkIndex = number | undefined;
export type SelectedBookmark = Bookmark | undefined;
