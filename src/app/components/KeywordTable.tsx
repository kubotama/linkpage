import React from "react";

import { Keyword } from "../types/Keyword";

export const KeywordTable: React.FC<{
  keywords: Keyword[];
}> = ({ keywords }) => {
  return (
    <div role="keyword-table" className="flex flex-col " aria-label="キーワードのテーブル">
      {keywords.map((keyword) => {
        return (
          <div role="keyword-row" key={keyword.keyword_id}>
            <div role="keyword-cell">{keyword.keyword_name}</div>
          </div>
        );
      })}
    </div>
  );
};
