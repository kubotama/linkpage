import "@testing-library/jest-dom";

import { describe, expect, it } from "vitest"; // Vitestから必要なものをインポート

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { useErrorMessage } from "./useErrorMessage";

describe("useErrorMessage", () => {
  // useErrorMessage フックをテストするためのヘルパーコンポーネント
  const TestComponent = () => {
    const {
      textMessage,
      setErrorMessage,
      setLoadingMessage,
      isError,
      handleErrorClose,
    } = useErrorMessage();

    return (
      <div>
        <div data-testid="text-message">{textMessage}</div>
        <div data-testid="error-state">{isError.toString()}</div>
        <button onClick={() => setErrorMessage("Test Error")}>Set Error</button>
        <button onClick={() => setLoadingMessage("Test Loading")}>
          Set Loading
        </button>
        <button onClick={handleErrorClose}>Close Error</button>
      </div>
    );
  };

  it("should initialize with loading message", () => {
    render(<TestComponent />);
    expect(screen.getByTestId("text-message")).toHaveTextContent("");
    expect(screen.getByTestId("error-state")).toHaveTextContent("false");
  });

  it("should set error message and update textMessage", async () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button", { name: "Set Error" }));

    // useEffect の更新を待つ
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent(
        "Test Error"
      );
    });
    expect(screen.getByTestId("error-state")).toHaveTextContent("true");
  });

  it("should set loading message and update textMessage", async () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button", { name: "Set Loading" }));

    // useEffect の更新を待つ
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent(
        "Test Loading"
      );
    });
    expect(screen.getByTestId("error-state")).toHaveTextContent("false");
  });

  it("should prioritize error message over loading message", async () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button", { name: "Set Loading" }));
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent(
        "Test Loading"
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Set Error" }));
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent(
        "Test Error"
      );
    });
    expect(screen.getByTestId("error-state")).toHaveTextContent("true");
  });

  it("should clear textMessage when handleErrorClose is called", async () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button", { name: "Set Error" }));
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent(
        "Test Error"
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Close Error" }));
    expect(screen.getByTestId("text-message")).toHaveTextContent("");
    expect(screen.getByTestId("error-state")).toHaveTextContent("false"); // handleErrorCloseはerrorMessageの状態を変更しない
  });
});
