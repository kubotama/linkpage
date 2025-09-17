import React from "react";

import {
  BASE_CELL_STYLE,
  ROW_STYLE_DEFAULT,
  ROW_STYLE_KEYWORD_SELECTED,
} from "../constants/constants";
import { useKeywordTable } from "../hooks/useKeywordTable";
import { Keyword } from "../types/Keyword";
import { ActionButton } from "./ActionButton";

type KeywordTableProps = {
  keywords?: Keyword[];
  className?: string;
  labelText: string;
  headerText: string;
  selectedKeywordId?: number;
  setSelectedKeywordId: (keywordId: number | undefined) => void;
  rowActionButton?: {
    label: string;
    onClick: (keywordId: number) => void;
  };
};

export const KeywordTable = ({
  keywords = [],
  className,
  labelText,
  headerText,
  selectedKeywordId,
  setSelectedKeywordId,
  rowActionButton = undefined,
}: KeywordTableProps): React.ReactElement | null => {
  const { handleSelectKeyword } = useKeywordTable({
    selectedKeywordId,
    setSelectedKeywordId,
  });

  if (keywords.length === 0) {
    return null;
  }

  return (
    <table aria-label={labelText} className={className}>
      <thead>
        <tr>
          <th scope="col">{headerText}</th>
          {rowActionButton && (
            <th scope="col" className="sr-only">
              操作
            </th>
          )}
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
            {rowActionButton && (
              <td>
                <ActionButton
                  className="w-auto"
                  onClick={() => rowActionButton.onClick(keyword.keyword_id)}
                >
                  {rowActionButton.label}
                </ActionButton>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
