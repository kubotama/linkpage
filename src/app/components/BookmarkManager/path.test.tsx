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

describe("「←」ボタン: URLから、/の階層を一段、削除する", () => {
  it("https://mail.google.com/mail/u/0/", async () => {
    const url = "https://mail.google.com/mail/u/0/#inbox";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
    });
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376", async () => {
    const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue(
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
      );
    });
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/", async () => {
    const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue(
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
      );
    });
  });

  it("https://xtech.nikkei.com", async () => {
    const url = "https://xtech.nikkei.com";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });
    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://xtech.nikkei.com");
    });
  });

  it("https://xtech.nikkei.com/", async () => {
    const url = "https://xtech.nikkei.com/";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://xtech.nikkei.com/");
    });
  });
});
