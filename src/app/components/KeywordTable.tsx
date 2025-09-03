import React from "react";

import { Keyword } from "../types/Keyword";

import { TABLE_NAME_KEYWORD } from "../constants/constants";

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
                  ? "bg-green-500 text-gray-100"
                  : "bg-gray-100 text-gray-900"
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
