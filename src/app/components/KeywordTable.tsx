import React from "react";

import { Keyword } from "../types/Keyword";

export const KeywordTable: React.FC<{
  keywords: Keyword[];
}> = ({ keywords }) => {
  return (
    <table aria-label="キーワードのテーブル">
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
