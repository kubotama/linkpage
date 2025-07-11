import { ActionButton } from "./ActionButton";

export const ErrorMessage: React.FC<{
  textMessage: string;
  isError: boolean;
  handleErrorClose: () => void;
}> = ({ textMessage, isError, handleErrorClose }) => {
  return (
    <div className="mb-1 flex justify-center items-center h-8">
      {textMessage && (
        <>
          {isError && ( // エラーメッセージがある場合のみ「閉じる」ボタンを表示
            <ActionButton onClick={handleErrorClose}>閉じる</ActionButton>
          )}
          <div
            data-testid="bookmark-message"
            className="ml-2"
            style={{
              color: isError ? "red" : "inherit", // エラーの場合は文字色を赤に
            }}
          >
            {textMessage}
          </div>
        </>
      )}
    </div>
  );
};
