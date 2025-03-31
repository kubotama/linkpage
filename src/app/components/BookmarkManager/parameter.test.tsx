import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React, { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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

describe("「パラメータ」ボタン: URLから無駄な文字列を削除する#61", () => {
  describe("#や?の後ろを削除する", () => {
    it("https://mail.google.com/mail/u/0/#inbox", async () => {
      const url = "https://mail.google.com/mail/u/0/#inbox";

      fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

      await act(async () => {
        render(<BookmarkManager />);
      });
      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });

    it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh", async () => {
      const url =
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh";

      fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

      await act(async () => {
        render(<BookmarkManager />);
      });

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue(
          "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/"
        );
      });
    });

    it("https://mail.google.com/mail/u/0/", async () => {
      const url = "https://mail.google.com/mail/u/0/";

      await act(async () => {
        render(<BookmarkManager />);
      });

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });
  });
});
