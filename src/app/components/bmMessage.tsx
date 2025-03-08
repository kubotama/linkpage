import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

import { useMessage } from "../contexts/MessageContext";

const BmMessage = () => {
  const [bmMessageText, setBmMessageText] = useState(<div></div>);
  const { message, setMessage } = useMessage();

  useEffect(() => {
    setBmMessageText(
      <div>
        <Button
          onClick={() => {
            setMessage({ text: "" });
          }}
        >
          確認
        </Button>
        <span data-testid="bm-message">
          {message !== null && message.text.length > 0 ? (
            <>{message.text}</>
          ) : (
            <>linkpage</>
          )}
        </span>
      </div>
    );
  }, [message, setMessage]);

  return bmMessageText;
};

export default BmMessage;
