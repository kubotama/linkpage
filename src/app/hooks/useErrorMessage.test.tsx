import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it } from "vitest"; // Vitestから必要なものをインポート

import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { useErrorMessage } from "./useErrorMessage";
import { clickButtonByName } from "../test-utils/bookmarkTestUtils";

describe("useErrorMessage", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // useErrorMessage フックをテストするためのヘルパーコンポーネント
  const TestComponent = () => {
    const { textMessage, setMessage, isError, handleErrorClose } = useErrorMessage();

    return (
      <div>
        <div data-testid="text-message">{textMessage}</div>
        <div data-testid="error-state">{isError.toString()}</div>
        <button onClick={() => setMessage("Test Error", true)}>Set Error</button>
        <button onClick={() => setMessage("Test Loading", false)}>Set Loading</button>
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
    await clickButtonByName(user, "Set Error");

    // useEffect の更新を待つ
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent("Test Error");
    });
    expect(screen.getByTestId("error-state")).toHaveTextContent("true");
  });

  it("should set loading message and update textMessage", async () => {
    render(<TestComponent />);
    await clickButtonByName(user, "Set Loading");

    // useEffect の更新を待つ
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent("Test Loading");
    });
    expect(screen.getByTestId("error-state")).toHaveTextContent("false");
  });

  it("should prioritize error message over loading message", async () => {
    render(<TestComponent />);

    await clickButtonByName(user, "Set Loading");

    // useEffect の更新を待つ
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent("Test Loading");
    });

    await clickButtonByName(user, "Set Error");

    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent("Test Error");
    });
    expect(screen.getByTestId("error-state")).toHaveTextContent("true");
  });

  it("should clear textMessage when handleErrorClose is called", async () => {
    render(<TestComponent />);
    await clickButtonByName(user, "Set Error");

    // useEffect の更新を待つ
    await waitFor(() => {
      expect(screen.getByTestId("text-message")).toHaveTextContent("Test Error");
    });

    await clickButtonByName(user, "Close Error");

    expect(screen.getByTestId("text-message")).toHaveTextContent("");
    expect(screen.getByTestId("error-state")).toHaveTextContent("false"); // handleErrorCloseはerrorMessageの状態を変更しない
  });
});
