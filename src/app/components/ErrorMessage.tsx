import { ActionButton } from "./ActionButton";

type ErrorMessageProps = {
  textMessage: string;
  isError: boolean;
  handleErrorClose: () => void;
  className?: string;
};

export const ErrorMessage = ({
  textMessage,
  isError,
  handleErrorClose,
  className,
}: ErrorMessageProps): React.ReactElement => {
  return (
    <div className={className ?? ""}>
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
