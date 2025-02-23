import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MessageProvider, useMessage } from "./MessageContext";

const TestComponent = () => {
  const { message, setMessage } = useMessage();
  return (
    <div>
      {message && <div data-testid="message">{message.text}</div>}
      <button onClick={() => setMessage({ text: "テストメッセージ" })}>
        メッセージを表示
      </button>
    </div>
  );
};

describe("MessageContext", () => {
  it("メッセージを表示できること", () => {
    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    // 初期状態ではlinkpageが表示されていることを確認する
    expect(screen.getByTestId("message")).toHaveTextContent("linkpage");
  });
});
