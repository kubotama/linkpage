import React from "react";

import { Keyword } from "../types/Keyword";

import { TABLE_NAME_KEYWORD } from "../constants/constants";

type KeywordTableProps = {
  keywords?: Keyword[];
  className?: string;
};

export const KeywordTable = ({
  keywords = [],
  className,
}: KeywordTableProps): React.ReactElement => {
  return (
    <table aria-label={TABLE_NAME_KEYWORD} className={className}>
      <thead className="sr-only">
        <tr>
          <th scope="col">キーワード</th>
        </tr>
      </thead>
      <tbody>
        {keywords.map((keyword) => (
          <tr key={keyword.keyword_id}>
            <td className="p-1 text-sm border border-gray-700 bg-gray-100 text-gray-900">
              {keyword.keyword_name}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
