import React, { useState } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { useMessage } from "../contexts/MessageContext";

interface BmDetailProps {
  onAddBookmark: (textUrl: string, textTitle: string) => void;
}

export const BmDetail: React.FC<BmDetailProps> = ({
  onAddBookmark: onAddBookmark,
}) => {
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const { setMessage } = useMessage();

  const updateClick = () => {
    onAddBookmark(textUrl, textTitle);
  };

  const titleClick = async () => {
    fetch("/api/title?url=" + textUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Can't find title: [${response.status}] `);
        } else {
          return response.text();
        }
      })
      .then((text) => {
        if (!text) {
          throw new Error(`Can't find title: `);
        } else {
          setTextTitle(text);
          setMessage({ text: "" });
        }
      })
      .catch((error) => {
        setTextTitle("");
        setMessage({ text: error.message + textUrl });
      });
  };

  return (
    <div>
      <Box display="flex" alignItems="center" sx={{ marginBottom: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: "100px", height: "2rem", marginRight: "20px" }}
          onClick={titleClick}
        >
          タイトル
        </Button>
        <input
          style={{ width: "50%", height: "20px" }}
          id="url"
          placeholder="URL"
          type="text"
          aria-label="url"
          value={textUrl}
          onChange={(e) => {
            setTextUrl(e.target.value);
          }}
        />
      </Box>
      <Box display="flex" alignItems="center">
        <Button
          variant="contained"
          color="primary"
          style={{ width: "100px", height: "2rem", marginRight: "20px" }}
          onClick={updateClick}
        >
          追加
        </Button>
        <input
          style={{ width: "50%", height: "20px" }}
          id="title"
          placeholder="タイトル"
          type="text"
          aria-label="title"
          value={textTitle}
          onChange={(e) => {
            setTextTitle(e.target.value);
          }}
        />
      </Box>
    </div>
  );
};

export default BmDetail;
