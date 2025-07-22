import React from "react";

import { Keyword } from "../types/Keyword";

export const KeywordTable: React.FC<{
  keywords: Keyword[];
}> = ({ keywords }) => {
  return (
    <div role="table" className="flex flex-col" aria-label="キーワードのテーブル">
      {keywords.map((keyword) => {
        return (
          <div role="row" key={keyword.keyword_id}>
            <div role="cell">{keyword.keyword_name}</div>
          </div>
        );
      })}
    </div>
  );
};
