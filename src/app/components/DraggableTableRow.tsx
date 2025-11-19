import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

import { BASE_CELL_STYLE } from "../constants/constants";
import { Bookmark } from "../types/Bookmark";

type DraggableTableRowProps = {
  bookmark: Bookmark;
  rowStyle: string;
  onSelectBookmark: (bookmarkId: number) => void;
};

export const DraggableTableRow = ({
  bookmark,
  rowStyle,
  onSelectBookmark,
}: DraggableTableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: bookmark.bookmark_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelectBookmark(bookmark.bookmark_id)}
      className="cursor-pointer"
    >
      <td className={`text-sm ${rowStyle} ${BASE_CELL_STYLE}`}>{bookmark.title}</td>
    </tr>
  );
};
