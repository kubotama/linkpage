import React from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { Bookmark } from "../types/Bookmark";

// import { useSelectBookmark } from "./BookmarkManager";

export const BookmarkTable: React.FC<{
  bookmarks: Bookmark[];
  onSelectBookmark: (bookmark: Bookmark | null) => void;
}> = ({ bookmarks, onSelectBookmark }) => {
  // const [, selectBookmark] = useSelectBookmark();

  return (
    <TableContainer component={Paper}>
      <Table aria-label="bookmarks table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookmarks.map((bookmark, index) => (
            <TableRow key={index} onClick={() => onSelectBookmark(bookmark)}>
              <TableCell size="small">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bookmark.title}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
