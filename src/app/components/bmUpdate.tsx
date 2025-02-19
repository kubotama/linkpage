// MyComponent.tsx
import React, { useState, useRef } from "react";

interface BmUpdateProps {
  onBmUpdate: (textUrl: string, textTitle: string) => void;
}

export const BmUpdate: React.FC<BmUpdateProps> = ({
  onBmUpdate: onBmUpdate,
}) => {
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const textUrlRef1 = useRef<HTMLInputElement>(null);
  const textTitleRef2 = useRef<HTMLInputElement>(null);

  const updateClick = () => {
    if (textUrlRef1.current && textTitleRef2.current) {
      const inputTextUrl = textUrlRef1.current.value;
      const inputTextTitle = textTitleRef2.current.value;
      onBmUpdate(inputTextUrl, inputTextTitle);
    }
  };

  const titleClick = () => {
    fetch("/title?url=" + textUrl)
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        setTextTitle(text);
      });
  };

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
      <button onClick={titleClick}>タイトル</button>
      <button onClick={updateClick}>更新</button>
    </div>
  );
};

export default BmUpdate;
