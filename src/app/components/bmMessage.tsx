import { useEffect, useState } from "react";

import { useMessage } from "../contexts/MessageContext";

const BmMessage = () => {
  const [bmMessageText, setBmMessageText] = useState(<div></div>);
  const { message, setMessage } = useMessage();

  useEffect(() => {
    setBmMessageText(
      <div>
        {message !== null && message.text.length > 0 ? (
          <>
            <div data-testid="bm-message">{message.text}</div>
            <button
              onClick={() => {
                setMessage({ text: "" });
              }}
            >
              確認
            </button>
          </>
        ) : (
          <div data-testid="bm-message">linkpage</div>
        )}
      </div>
    );
  }, [message, setMessage]);

  return bmMessageText;
};

export default BmMessage;
