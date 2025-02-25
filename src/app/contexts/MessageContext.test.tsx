import "@testing-library/jest-dom";

import React from "react";

import { act, render, screen } from "@testing-library/react";

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

  it("プロバイダーの外で利用した場合", () => {
    try {
      render(<TestComponent />);
      fail("発生すべき例外が発生しませんでした");
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toBe(
          "useMessage must be used within a MessageProvider"
        );
      } else {
        fail("予期しない例外が発生しました");
      }
    }
  });
});
