import fetch from "cross-fetch";

export type Bookmark = {
  url: string;
  title: string;
};

let bookmarks: Bookmark[] = [];

export const Bookmarks = async (): Promise<Bookmark[]> => {
  if (bookmarks.length === 0) {
    const response = await fetch("http://localhost:3001/bookmark.json");
    const data = await response.json();
    bookmarks = data;
  }
  return bookmarks;
};
