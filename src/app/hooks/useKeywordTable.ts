import { useCallback } from "react";

type UseKeywordTableProps = {
  selectedKeywordId: number | undefined;
  setSelectedKeywordId: (keywordId: number | undefined) => void;
};

export const useKeywordTable = ({
  selectedKeywordId,
  setSelectedKeywordId,
}: UseKeywordTableProps) => {
  const handleSelectKeyword = useCallback(
    (keywordId: number) => {
      setSelectedKeywordId(selectedKeywordId === keywordId ? undefined : keywordId);
    },
    [selectedKeywordId, setSelectedKeywordId]
  );

  return { handleSelectKeyword };
};
