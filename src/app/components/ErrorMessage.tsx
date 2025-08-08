import { ActionButton } from "./ActionButton";

type ErrorMessageProps = {
  textMessage: string;
  isError: boolean;
  handleErrorClose: () => void;
};

export const ErrorMessage = ({
  textMessage,
  isError,
  handleErrorClose,
}: ErrorMessageProps): React.ReactElement => {
  return (
    <div className="mb-1 flex justify-center items-center h-8">
      {textMessage && (
        <>
          {isError && ( // エラーメッセージがある場合のみ「閉じる」ボタンを表示
            <ActionButton onClick={handleErrorClose}>閉じる</ActionButton>
          )}
          <div data-testid="bookmark-message" className={`ml-2 ${isError ? "text-red-500" : ""}`}>
            {textMessage}
          </div>
        </>
      )}
    </div>
  );
};
