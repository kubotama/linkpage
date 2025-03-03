import React, { useEffect, useRef, useState } from "react";

import { useMessage } from "../contexts/MessageContext";

interface BmDetailProps {
  onAddBookmark: (textUrl: string, textTitle: string) => void;
}

export const BmDetail: React.FC<BmDetailProps> = ({
  onAddBookmark: onAddBookmark,
}) => {
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textUrlDisabled, setTextUrlDisabled] = useState(true);
  const [textTitleDisabled, setTextTitleDisabled] = useState(true);
  const textUrlRef1 = useRef<HTMLInputElement>(null);
  const textTitleRef2 = useRef<HTMLInputElement>(null);
  const { setMessage } = useMessage();

  const updateClick = () => {
    if (textUrlRef1.current && textTitleRef2.current) {
      const inputTextUrl = textUrlRef1.current.value;
      const inputTextTitle = textTitleRef2.current.value;
      onAddBookmark(inputTextUrl, inputTextTitle);
    }
  };

  const titleClick = async () => {
    const response = await fetch("/api/title?url=" + textUrl);
    const text = await response.text();

    if (!response.ok) {
      setTextTitle("");
      setMessage({ text: text });
    } else {
      setTextTitle(text);
    }
  };

  useEffect(() => {
    if (textUrl === "") {
      setTextUrlDisabled(true);
      setTextTitleDisabled(true);
    } else {
      setTextUrlDisabled(false);
      if (textTitle === "") {
        setTextTitleDisabled(true);
      } else {
        setTextTitleDisabled(false);
      }
    }
  }, [textUrl, textTitle]);

  return (
    <div>
      <input
        type="text"
        aria-label="url"
        value={textUrl}
        onChange={(e) => setTextUrl(e.target.value)}
        ref={textUrlRef1}
      />
      <input
        type="text"
        aria-label="title"
        value={textTitle}
        onChange={(e) => setTextTitle(e.target.value)}
        ref={textTitleRef2}
      />
      <button onClick={titleClick} disabled={textUrlDisabled}>
        タイトル
      </button>
      <button onClick={updateClick} disabled={textTitleDisabled}>
        更新
      </button>
    </div>
  );
};

export default BmDetail;
