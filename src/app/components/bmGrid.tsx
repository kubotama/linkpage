// import React, { useState, useEffect } from "react";
import React from "react";

import { Bookmark } from "../page";
import { BmRow } from "./bmRow";

export const BmGrid: React.FC<{ bookmarks: Bookmark[] }> = ({ bookmarks }) => {
  return bookmarks.length === 0 ? (
    <div>Loading...</div>
  ) : (
    <div className="grid grid-cols-1">
      {bookmarks.map((bookmark, index) => (
        <BmRow key={index} bookmark={bookmark} />
      ))}
    </div>
  );
};
