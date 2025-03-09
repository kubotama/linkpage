import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { useMessage } from "../contexts/MessageContext";

const BmMessage = () => {
  const [bmMessageText, setBmMessageText] = useState(<div></div>);
  const { message, setMessage } = useMessage();

  useEffect(() => {
    setBmMessageText(
      <div>
        <Box display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "6rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={() => {
              setMessage({ text: "" });
            }}
          >
            確認
          </Button>
          <span
            data-testid="bm-message"
            style={{ fontSize: "1.2rem", padding: "0.5rem" }}
          >
            {message !== null && message.text.length > 0 ? (
              <>{message.text}</>
            ) : (
              <>linkpage</>
            )}
          </span>
        </Box>
      </div>
    );
  }, [message, setMessage]);

  return bmMessageText;
};

export default BmMessage;
