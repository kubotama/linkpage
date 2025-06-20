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

import { Bookmark, SelectedBookmark } from "../types/Bookmark";

export const BookmarkTable: React.FC<{
  bookmarks: Bookmark[];
  onSelectBookmark: (bookmark: SelectedBookmark) => void;
}> = ({ bookmarks, onSelectBookmark }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="bookmarks table">
        <TableHead>
          <TableRow>
            <TableCell>タイトル</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookmarks.map((bookmark, index) => (
            <TableRow key={index} onClick={() => onSelectBookmark(bookmark)}>
              <TableCell size="small">{bookmark.title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
