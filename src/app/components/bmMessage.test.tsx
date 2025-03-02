import "@testing-library/jest-dom";

import React from "react";

import { act, render, screen } from "@testing-library/react";

import { MessageProvider, useMessage } from "../contexts/MessageContext";
import BmMessage from "./bmMessage";

describe("BmMessage", () => {
  it("初期状態", () => {
    const TestComponent = () => {
      return (
        <div>
          <BmMessage />
        </div>
      );
    };

    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    expect(screen.getByText("linkpage")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
  });

  it("設定したメッセージを表示できること", () => {
    const TestComponent = () => {
      const { setMessage } = useMessage();

      return (
        <div>
          <BmMessage />
          <button onClick={() => setMessage({ text: "テストメッセージ" })}>
            メッセージを表示
          </button>
        </div>
      );
    };

    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    expect(screen.queryByText("テストメッセージ")).toBeNull();
    expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: "メッセージを表示" }).click();
    });

    expect(screen.getByText("テストメッセージ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
  });

  it("確認ボタンをクリック", () => {
    // 確認ボタンをクリックすると、メッセージがlinkpageに戻って、確認ボタンは表示されない
    const TestComponent = () => {
      const { setMessage } = useMessage();

      return (
        <div>
          <BmMessage />
          <button onClick={() => setMessage({ text: "テストメッセージ" })}>
            メッセージを表示
          </button>
        </div>
      );
    };

    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    act(() => {
      screen.getByRole("button", { name: "メッセージを表示" }).click();
    });

    act(() => {
      screen.getByRole("button", { name: "確認" }).click();
    });

    expect(screen.getByText("linkpage")).toBeInTheDocument();
    expect(screen.queryByText("テストメッセージ")).toBeNull();
    expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
  });
});
