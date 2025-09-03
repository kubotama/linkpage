import React from "react";

import {
  ROW_STYLE_DEFAULT,
  ROW_STYLE_KEYWORD_SELECTED,
  TABLE_NAME_KEYWORD,
} from "../constants/constants";
import { Keyword } from "../types/Keyword";

type KeywordTableProps = {
  keywords?: Keyword[];
  className?: string;
  selectedKeywordId?: number;
  setSelectedKeywordId: (keywordId: number) => void;
};

export const KeywordTable = ({
  keywords = [],
  className,
  selectedKeywordId,
  setSelectedKeywordId,
}: KeywordTableProps): React.ReactElement => {
  const handleSelectKeyword = (keywordId: number) => {
    setSelectedKeywordId(keywordId);
  };

  return (
    <table aria-label={TABLE_NAME_KEYWORD} className={className}>
      <thead className="sr-only">
        <tr>
          <th scope="col">キーワード</th>
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
              className={`p-1 text-sm border border-gray-700 ${
                selectedKeywordId === keyword.keyword_id
                  ? `${ROW_STYLE_KEYWORD_SELECTED}`
                  : `${ROW_STYLE_DEFAULT}`
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
