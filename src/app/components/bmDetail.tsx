import React, { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

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

  const urlClick = () => {
    // #や?の後ろを削除する
    const regex = /(http|https):\/\/(.*?)(?:[#\?].*|$)/;
    const matches = textUrl.match(regex);

    if (matches && matches.length > 2) {
      setTextUrl(matches[1] + "://" + matches[2]);
    }
  };

  return (
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
      <Box display="flex" alignItems="center">
        <Button onClick={urlClick}>URL</Button>
      </Box>
      <Box display="flex" alignItems="center" sx={{ marginBottom: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: "6rem", height: "2rem", marginRight: "0.7rem" }}
          onClick={titleClick}
        >
          タイトル
        </Button>
        <input
          style={{
            padding: "0.5rem",
            width: "80%",
            height: "1.2rem",
            maxWidth: "1200px",
            minWidth: "800px",
          }}
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
          sx={{ width: "6rem", height: "2rem", marginRight: "0.7rem" }}
          onClick={updateClick}
        >
          追加
        </Button>
        <input
          style={{
            padding: "0.5rem",
            width: "80%",
            height: "1.2rem",
            maxWidth: "1200px",
            minWidth: "800px",
          }}
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
