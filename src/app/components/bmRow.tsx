import React, { useEffect, useState } from "react";

import { Bookmark } from "./BookmarkManager";

export const BmRow: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => {
  const [bmRow, setBmRow] = useState(<div></div>);
  useEffect(() => {
    setBmRow(() => (
      <div className="grid-item">
        <a href={bookmark.url} target="_blank">
          {bookmark.title}
        </a>
      </div>
    ));
  }, [bookmark]);

  return bmRow;
};
