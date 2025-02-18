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

  const handleClick = () => {
    if (textUrlRef1.current && textTitleRef2.current) {
      const inputTextUrl = textUrlRef1.current.value;
      const inputTextTitle = textTitleRef2.current.value;
      onBmUpdate(inputTextUrl, inputTextTitle);
    }
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
      <button>タイトル</button>
      <button onClick={handleClick}>更新</button>
    </div>
  );
};

export default BmUpdate;
