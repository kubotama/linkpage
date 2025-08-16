import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest"; // Vitestから必要なものをインポート

import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  let user: UserEvent;

  beforeEach(() => {
    vi.resetAllMocks();
    user = userEvent.setup();
  });

  it("should display loading message initially", async () => {
    const textMessage = "ブックマークをロード中...";
    const isError = false;
    const handleErrorClose = vi.fn();

    render(
      <ErrorMessage
        textMessage={textMessage}
        isError={isError}
        handleErrorClose={handleErrorClose}
      />
    );

    expect(screen.getByTestId("bookmark-message")).toHaveTextContent("ブックマークをロード中...");
    expect(screen.getByTestId("bookmark-message")).not.toHaveStyle("color: red");
    expect(screen.queryByRole("button", { name: "閉じる" })).not.toBeInTheDocument();
  });

  it("should display error message and close button when there is an error", () => {
    const textMessage = "エラーが発生しました";
    const isError = true;
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
    expect(errorMessageElement).toHaveClass("text-red-500");
    expect(screen.getByRole("button", { name: "閉じる" })).toBeVisible();
  });

  it("should call handleErrorClose when close button is clicked", async () => {
    const textMessage = "エラーが発生しました";
    const isError = true;
    const handleErrorClose = vi.fn();

    render(
      <ErrorMessage
        textMessage={textMessage}
        isError={isError}
        handleErrorClose={handleErrorClose}
      />
    );
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(handleErrorClose).toHaveBeenCalledTimes(1);
  });

  it("should display no message when textMessage is empty", () => {
    const textMessage = "";
    const isError = false;
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
