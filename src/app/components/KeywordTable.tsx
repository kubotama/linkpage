import React from "react";

import {
  BASE_CELL_STYLE,
  ROW_STYLE_DEFAULT,
  ROW_STYLE_KEYWORD_SELECTED,
  TABLE_NAME_KEYWORD,
} from "../constants/constants";
import { useKeywordTable } from "../hooks/useKeywordTable";
import { Keyword } from "../types/Keyword";
import { ActionButton } from "./ActionButton";

type KeywordTableProps = {
  keywords?: Keyword[];
  className?: string;
  selectedKeywordId?: number;
  setSelectedKeywordId: (keywordId: number | undefined) => void;
  unlinkKeywordClick: (keywordId: number) => void;
};

export const KeywordTable = ({
  keywords = [],
  className,
  selectedKeywordId,
  setSelectedKeywordId,
  unlinkKeywordClick,
}: KeywordTableProps): React.ReactElement | null => {
  const { handleSelectKeyword } = useKeywordTable({
    selectedKeywordId,
    setSelectedKeywordId,
  });

  if (keywords.length === 0) {
    return null;
  }

  return (
    <table aria-label={TABLE_NAME_KEYWORD} className={className}>
      <thead>
        <tr>
          <th scope="col">キーワード一覧</th>
          <th scope="col" className="sr-only">
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        {keywords.map((keyword) => (
          <tr key={keyword.keyword_id}>
            <td
              onClick={() => handleSelectKeyword(keyword.keyword_id)}
              data-testid={`keyword-row-${keyword.keyword_id}`}
              className={`text-sm w-keyword-input cursor-pointer ${BASE_CELL_STYLE} ${
                selectedKeywordId === keyword.keyword_id
                  ? ROW_STYLE_KEYWORD_SELECTED
                  : ROW_STYLE_DEFAULT
              }`}
            >
              {keyword.keyword_name}
            </td>
            <td>
              <ActionButton
                className="w-auto"
                onClick={() => unlinkKeywordClick(keyword.keyword_id)}
              >
                解除
              </ActionButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
