import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MessageProvider } from "../contexts/MessageContext";
import BmMessage from "./bmMessage";
import { Bookmark } from "./bmRow";
import { BookmarkManager } from "./BookmarkManager";

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

describe("BookmarkManagerの表示を確認", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("すべてのエレメントが表示されることを確認", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <MessageProvider>
        <BookmarkManager />
      </MessageProvider>
    );

    await waitFor(() => {
      const bm = screen.getByText("Amazon");
      expect(bm).toBeInTheDocument();
      expect(bm).toHaveAttribute("href", "https://www.amazon.co.jp/");
      expect(bm).toHaveAttribute("target", "_blank");
    });
  });

  it("ローディング中にローディングメッセージが表示されること", () => {
    fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする
    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    expect(screen.getByTestId("bm-message")).toHaveTextContent(/^Loading...$/);
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce("Internal Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        /Failed to fetch: \[500\] Internal Server Error$/
      );
    });
  });
});

describe("更新されたブックマークが、APIにPOSTで送られる。", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("更新ボタンをクリックすると、画面のブックマークの最後に追加される", async () => {
    // Initial GET request mock
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(screen.queryByText("Example Site")).toBeNull();
    });

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const updateButton = screen.getByText("更新");

    fireEvent.change(urlInput, {
      target: { value: "https://www.example.com" },
    });
    fireEvent.change(titleInput, {
      target: { value: "Example Site" },
    });
    fireEvent.click(updateButton);

    // Trigger bookmark update
    await waitFor(() => {
      expect(screen.getByText("Example Site")).toBeInTheDocument();
    });
  });

  it("更新されたブックマークが、APIにPOSTで送られる", async () => {
    // Initial GET request mock
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(screen.queryByText("Example Site")).toBeNull();
    });

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const updateButton = screen.getByText("更新");

    const updatedBookmark = {
      url: "https://www.example.com",
      title: "Example Site",
    };

    // POST request mock
    fetchMock.mockResponse(JSON.stringify(updatedBookmark), {
      status: 200,
    });

    fireEvent.change(urlInput, {
      target: { value: "https://www.example.com" },
    });
    fireEvent.change(titleInput, {
      target: { value: "Example Site" },
    });
    fireEvent.click(updateButton);

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

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
    });

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const updateButton = screen.getByText("更新");

    fetchMock.mockResponseOnce("API Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    fireEvent.change(urlInput, {
      target: { value: "https://www.example.com" },
    });
    fireEvent.change(titleInput, {
      target: { value: "Example Site" },
    });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        /BookmarkManager: \[500\] Internal Server Error$/
      );
    });
  });

  it("ブックマークを更新するAPIのfetchがrejectした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
    });

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const updateButton = screen.getByText("更新");

    fetchMock.mockRejectOnce(new Error("API Error"));

    fireEvent.change(urlInput, {
      target: { value: "https://www.example.com" },
    });
    fireEvent.change(titleInput, {
      target: { value: "Example Site" },
    });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        "BookmarkManager: Error: API Error"
      );
    });
  });
});
