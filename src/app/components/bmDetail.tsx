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
    //   const response = await fetch("/api/title?url=" + textUrl);
    //   const text = await response.text();

    //   if (!response.ok) {
    //     setTextTitle("");
    //     setMessage({ text: text });
    //   } else {
    //     setTextTitle(text);
    //     setMessage({ text: "" });
    //   }
    fetch("/api/title?url=" + textUrl)
      .then((response) => {
        if (!response.ok) {
          // setTextTitle("");
          // setMessage({ text: "Can't find title" });
          throw new Error(`Can't find title: [${response.status}] `);
        } else {
          return response.text();
        }
      })
      .then((text) => {
        if (!text) {
          // setTextTitle("");
          // setMessage({ text: "Can't find title" });
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
      <TextField
        id="url"
        type="text"
        label="url"
        aria-label="url"
        value={textUrl}
        onChange={(e) => {
          setTextUrl(e.target.value);
        }}
      />
      <TextField
        id="title"
        type="text"
        label="title"
        aria-label="title"
        value={textTitle}
        onChange={(e) => {
          setTextTitle(e.target.value);
        }}
      />
      <Button onClick={titleClick}>タイトル</Button>
      <Button onClick={updateClick}>更新</Button>
    </div>
  );
};

export default BmDetail;
