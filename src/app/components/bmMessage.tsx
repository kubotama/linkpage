import { useEffect, useState } from "react";
import { useMessage } from "../contexts/MessageContext";

const BmMessage = () => {
  const [bmMessageText, setBmMessageText] = useState(<div></div>);
  const { message, setMessage } = useMessage();

  useEffect(() => {
    if (message !== null && message.text.length > 0) {
      setBmMessageText(
        <div>
          {message.text}
          <button
            onClick={() => {
              setMessage({ text: "" });
            }}
          >
            確認
          </button>
        </div>
      );
    } else {
      setBmMessageText(<div>linkpage</div>);
    }
  }, [message, setMessage]);

  return bmMessageText;
};

export default BmMessage;
