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
    // #や?のない場合は、入力されたURLをそのままとする
    const regex = /(https?:\/\/(.*?))(?:[#\?].*|$)/;
    const matches = textUrl.match(regex);

    if (matches && matches.length > 2) {
      setTextUrl(matches[1]);
    }
  };

  const pathClick = () => {
    const regex_notslash = /^(http:\/\/|https:\/\/)(.*\/)[^\/]+$/;
    const match_notslash = textUrl.match(regex_notslash);
    if (match_notslash) {
      setTextUrl(match_notslash[1] + match_notslash[2]);
      return;
    }
    const regex_slash = /^(http:\/\/|https:\/\/)(.+\/)[^\/]+\/$/;
    const match_slash = textUrl.match(regex_slash);
    if (match_slash) {
      setTextUrl(match_slash[1] + match_slash[2]);
      return;
    }
  };

  const openClick = () => {
    // 新しいウィンドウでURLを開く
    window.open(textUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
      <Box display="flex" alignItems="center" sx={{ marginBottom: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
          onClick={urlClick}
        >
          パラメータ
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
          onClick={pathClick}
        >
          ←
        </Button>
        <Button onClick={openClick}>開く</Button>
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
