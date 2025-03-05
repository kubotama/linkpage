import Button from "@mui/material/Button";
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
          </>
        ) : (
          <div data-testid="bm-message">linkpage</div>
        )}
        <Button
          onClick={() => {
            setMessage({ text: "" });
          }}
        >
          確認
        </Button>
      </div>
    );
  }, [message, setMessage]);

  return bmMessageText;
};

export default BmMessage;
