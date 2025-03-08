import React, { useState } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

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
      <div style={{ marginBottom: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          style={{ width: "100px", height: "40px", marginRight: "10px" }}
          onClick={titleClick}
        >
          タイトル
        </Button>
        <TextField
          id="url"
          type="text"
          aria-label="url"
          label="url"
          value={textUrl}
          style={{ width: "50%", height: "40px" }}
          onChange={(e) => {
            setTextUrl(e.target.value);
          }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          style={{ width: "100px", height: "40px", marginRight: "10px" }}
          onClick={updateClick}
        >
          追加
        </Button>
        <TextField
          id="title"
          type="text"
          aria-label="title"
          label="title"
          value={textTitle}
          style={{ width: "50%", height: "40px" }}
          onChange={(e) => {
            setTextTitle(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default BmDetail;
