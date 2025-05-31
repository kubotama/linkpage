import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockBookmarks: Bookmark[] = createBookmarkList([
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
]);

describe("更新されたブックマークが、APIにPOSTで送られる。", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("更新ボタンをクリックすると、画面のブックマークの最後に追加される", async () => {
    // Initial GET request mock
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(screen.queryByText("Example Site")).toBeNull();
    });

    fetchMock.resetMocks();

    fetchMock.mockResponseOnce(
      JSON.stringify({
        url: "https://www.example.com",
        title: "Example Site",
        id: 1,
      })
    );

    // POST request mock
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
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark/add", {
        body: JSON.stringify({
          id: 0,
          url: "https://www.example.com",
          title: "Example Site",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(screen.getByText("Example Site")).toBeInTheDocument();
    });
  });

  it("更新されたブックマークが、APIからエラーが返ってきた場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
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
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        /ブックマークの追加中にエラーが発生しました。$/
      );
    });
  });

  it("ブックマークを更新するAPIのfetchがrejectした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
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
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの追加中にエラーが発生しました。"
      );
    });
  });

  it("fetchの返り値が正しいjson形式でない場合にエラーを返す", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });
    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    fetchMock.mockResponseOnce("");

    await act(async () => {
      fireEvent.change(urlInput, {
        target: { value: "https://www.example.com" },
      });
      fireEvent.change(titleInput, { target: { value: "Example Site" } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの追加中にエラーが発生しました。"
      );
    });
  });

  it("既に登録されているブックマークと同じURLを追加しようとした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });
    await waitFor(() => {
      // Verify initial fetch was called
      expect(fetchMock).toHaveBeenCalledWith("/api/bookmark");
      expect(fetchMock.mock.calls.length).toEqual(1);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: "Bookmark with this URL already exists.",
        message: "指定されたURLのブックマークは既に登録されています。",
        url: "https://www.google.com/",
        title: "Google",
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );

    await act(async () => {
      fireEvent.change(urlInput, {
        target: { value: "https://www.google.com" },
      });
      fireEvent.change(titleInput, { target: { value: "Google" } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "既に登録されています。 https://www.google.com"
      );
    });
  });
});
