import { Keyword } from "./Keyword";

export type Bookmark = {
  bookmark_id: number;
  url: string;
  title: string;
  keywords?: Keyword[];
};

export type SelectedBookmarkIndex = number | undefined;
export type SelectedBookmark = Bookmark | undefined;
