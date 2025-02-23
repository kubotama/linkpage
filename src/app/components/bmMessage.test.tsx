import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import BmMessage from "./bmMessage";
import { MessageProvider } from "../contexts/MessageContext";

const TestComponent = () => {
  return (
    <div>
      <BmMessage />
    </div>
  );
};

describe("BmMessage", () => {
  it("初期状態", () => {
    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    expect(screen.getByText("linkpage")).toBeInTheDocument();
  });

  // it("メッセージを表示できること", () => {
  //   render(
  //     <MessageProvider>
  //       <TestComponent />
  //     </MessageProvider>
  //   );

  //   act(() => {
  //     screen.getByRole("button", { name: "確認" }).click();
  //   });

  //   expect(screen.getByText("テストメッセージ")).toBeInTheDocument();
  // });
});
