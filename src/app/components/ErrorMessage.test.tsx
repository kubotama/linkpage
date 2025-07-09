import "@testing-library/jest-dom";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"; // Vitestから必要なものをインポート

import { fireEvent, render, screen } from "@testing-library/react";

import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {});

  it("should display loading message initially", async () => {
    const textMessage = "ブックマークをロード中...";
    const isError = () => false;
    const handleErrorClose = vi.fn();

    render(
      <ErrorMessage
        textMessage={textMessage}
        isError={isError}
        handleErrorClose={handleErrorClose}
      />
    );

    expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
      "ブックマークをロード中..."
    );
    expect(screen.getByTestId("bookmark-message")).not.toHaveStyle(
      "color: red"
    );
    expect(
      screen.queryByRole("button", { name: "閉じる" })
    ).not.toBeInTheDocument();
  });

  it("should display error message and close button when there is an error", () => {
    const textMessage = "エラーが発生しました";
    const isError = () => true;
    const handleErrorClose = vi.fn();

    render(
      <ErrorMessage
        textMessage={textMessage}
        isError={isError}
        handleErrorClose={handleErrorClose}
      />
    );
    const errorMessageElement = screen.getByTestId("bookmark-message");
    expect(errorMessageElement).toHaveTextContent("エラーが発生しました");
    expect(errorMessageElement).toHaveStyle("color: rgb(255, 0, 0)");
    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
  });

  it("should call handleErrorClose when close button is clicked", () => {
    const textMessage = "エラーが発生しました";
    const isError = () => true;
    const handleErrorClose = vi.fn();

    render(
      <ErrorMessage
        textMessage={textMessage}
        isError={isError}
        handleErrorClose={handleErrorClose}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(handleErrorClose).toHaveBeenCalledTimes(1);
  });

  it("should display no message when textMessage is empty", () => {
    const textMessage = "";
    const isError = () => false;
    const handleErrorClose = vi.fn();

    const { container } = render(
      <ErrorMessage
        textMessage={textMessage}
        isError={isError}
        handleErrorClose={handleErrorClose}
      />
    );

    expect(container).toHaveTextContent("");
  });
});
