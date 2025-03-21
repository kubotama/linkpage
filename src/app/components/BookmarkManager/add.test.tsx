import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React, { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MessageProvider } from "../../contexts/MessageContext";
import BmMessage from "../bmMessage";
import { Bookmark, BookmarkManager } from "../BookmarkManager";

const mockBookmarks: Bookmark[] = [
  {
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
];

describe("更新されたブックマークが、APIにPOSTで送られる。", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("更新ボタンをクリックすると、画面のブックマークの最後に追加される", async () => {
    // Initial GET request mock
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(screen.queryByText("Example Site")).toBeNull();
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    await act(async () => {
      fireEvent.change(urlInput, {
        target: { value: "https://www.example.com" },
      });
      fireEvent.change(titleInput, { target: { value: "Example Site" } });
      fireEvent.click(updateButton);
    });

    // Trigger bookmark update
    await waitFor(() => {
      expect(screen.getByText("Example Site")).toBeInTheDocument();
    });
  });

  it("更新されたブックマークが、APIにPOSTで送られる", async () => {
    // Initial GET request mock
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(screen.queryByText("Example Site")).toBeNull();
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    const updatedBookmark = {
      url: "https://www.example.com",
      title: "Example Site",
    };

    // POST request mock
    fetchMock.mockResponse(JSON.stringify(updatedBookmark), {
      status: 200,
    });

    await act(async () => {
      fireEvent.change(urlInput, {
        target: { value: "https://www.example.com" },
      });
      fireEvent.change(titleInput, { target: { value: "Example Site" } });
      fireEvent.click(updateButton);
    });

    // Trigger bookmark update
    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...mockBookmarks, updatedBookmark]),
      });
    });
  });

  it("更新されたブックマークが、APIからエラーが返ってきた場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });
    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    fetchMock.mockResponseOnce("API Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    await act(async () => {
      fireEvent.change(urlInput, {
        target: { value: "https://www.example.com" },
      });
      fireEvent.change(titleInput, { target: { value: "Example Site" } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        /BookmarkManager: \[500\] Internal Server Error$/
      );
    });
  });

  it("ブックマークを更新するAPIのfetchがrejectした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    fetchMock.mockRejectOnce(new Error("API Error"));

    await act(async () => {
      fireEvent.change(urlInput, {
        target: { value: "https://www.example.com" },
      });
      fireEvent.change(titleInput, { target: { value: "Example Site" } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        "BookmarkManager: Error: API Error"
      );
    });
  });
});
