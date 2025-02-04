import React from "react";

import { Bookmark } from "./bookmark";

export const BmLink = ({ bookmark }: { bookmark: Bookmark }) => {
  return (
    <a href={bookmark.url} target="_blank">
      {bookmark.title}
    </a>
  );
};
