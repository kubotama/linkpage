import React from "react";

import { Keyword } from "../types/Keyword";

export const KeywordTable: React.FC<{
  keywords: Keyword[];
}> = ({ keywords }) => {
  return (
    <table aria-label="キーワードのテーブル">
      <thead className="sr-only">
        <tr>
          <th scope="col">キーワード</th>
        </tr>
      </thead>
      <tbody>
        {keywords.map((keyword) => (
          <tr key={keyword.keyword_id}>
            <td>{keyword.keyword_name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
