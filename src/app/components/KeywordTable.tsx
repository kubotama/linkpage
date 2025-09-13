import React from "react";

import {
  BASE_CELL_STYLE,
  ROW_STYLE_DEFAULT,
  ROW_STYLE_KEYWORD_SELECTED,
} from "../constants/constants";
import { useKeywordTable } from "../hooks/useKeywordTable";
import { Keyword } from "../types/Keyword";

type KeywordTableProps = {
  keywords?: Keyword[];
  className?: string;
  selectedKeywordId?: number;
  setSelectedKeywordId: (keywordId: number | undefined) => void;
};

export const KeywordTable = ({
  keywords = [],
  className,
  selectedKeywordId,
  setSelectedKeywordId,
}: KeywordTableProps): React.ReactElement | null => {
  const { handleSelectKeyword } = useKeywordTable({
    selectedKeywordId,
    setSelectedKeywordId,
  });

  if (keywords.length === 0) {
    return null;
  }

  return (
    <table className={className}>
      <thead>
        <tr>
          <th scope="col">キーワード一覧</th>
        </tr>
      </thead>
      <tbody>
        {keywords.map((keyword) => (
          <tr
            key={keyword.keyword_id}
            data-testid={`keyword-row-${keyword.keyword_id}`}
            onClick={() => handleSelectKeyword(keyword.keyword_id)}
            className="cursor-pointer"
          >
            <td
              className={`text-sm ${BASE_CELL_STYLE} ${
                selectedKeywordId === keyword.keyword_id
                  ? ROW_STYLE_KEYWORD_SELECTED
                  : ROW_STYLE_DEFAULT
              }`}
            >
              {keyword.keyword_name}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
