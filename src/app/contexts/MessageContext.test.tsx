import React from "react";

import { render, screen, act } from "@testing-library/react";
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
      <button onClick={() => setMessage({ text: "" })}>
        メッセージをクリア
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
    expect(screen.getByTestId("message")).toHaveTextContent("");
  });

  it("メッセージを設定", () => {
    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    act(() => {
      screen.getByRole("button", { name: "メッセージを表示" }).click();
    });

    expect(screen.getByText("テストメッセージ")).toBeInTheDocument();
  });

  it("メッセージをクリア", () => {
    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    act(() => {
      screen.getByRole("button", { name: "メッセージをクリア" }).click();
    });

    // expect(screen.getByText("")).toBeInTheDocument();
    // expect(screen.queryByTestId("message")).toBeNull();
    expect(screen.getByTestId("message")).toHaveTextContent("");
  });
});
