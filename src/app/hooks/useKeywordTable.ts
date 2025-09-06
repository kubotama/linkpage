type UseKeywordTableProps = {
  selectedKeywordId: number | undefined;
  setSelectedKeywordId: (keywordId: number | undefined) => void;
};

export const useKeywordTable = ({
  selectedKeywordId,
  setSelectedKeywordId,
}: UseKeywordTableProps) => {
  const handleSelectKeyword = (keywordId: number) => {
    setSelectedKeywordId(selectedKeywordId === keywordId ? undefined : keywordId);
  };

  return { handleSelectKeyword };
};
