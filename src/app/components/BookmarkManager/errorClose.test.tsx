import "@testing-library/jest-dom";

import { act } from "react";

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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

const mockFetch = vi.fn();

describe("BookmarkManager", () => {
  beforeEach(async () => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });

    await act(async () => {
      render(<BookmarkManager />);
    });
  });

  // Test case 1: Error message and close button are displayed when an error occurs
  // it("should display error message and close button when an error occurs", async () => {
  //   await addSameBookmark();

  //   // Wait for the error message to appear
  //   const errorSpan = await screen.findByTestId("bookmark-message");
  //   expect(errorSpan).toHaveTextContent(
  //     "既に登録されています。 https://www.google.com"
  //   );
  //   expect(errorSpan).toHaveStyle("color: red");

  //   // Wait for the close button to appear
  //   const closeButton = await screen.findByRole("button", { name: "閉じる" });
  //   expect(closeButton).toBeInTheDocument();
  // });

  // Test case 2: Clicking the close button clears the error message
  // it("should clear the error message when the close button is clicked", async () => {
  //   await addSameBookmark();

  //   const closeButton = await screen.findByRole("button", { name: "閉じる" });
  //   expect(closeButton).toBeInTheDocument();

  //   // Click the close button
  //   await act(async () => {
  //     fireEvent.click(closeButton);
  //   });
  //   // Wait for the error message and button to disappear
  //   // We check that the message span is still there but its content is empty
  //   // and the button is no longer in the document.
  //   await waitFor(() => {
  //     expect(
  //       screen.queryByRole("button", { name: "閉じる" })
  //     ).not.toBeInTheDocument();
  //     expect(
  //       screen.queryAllByText("既に登録されています。 https://www.google.com")
  //     ).toHaveLength(0);
  //   });
  // });

  //   // Test case 3: Close button is not displayed when there is no error
  it("should not display the close button when there is no error", async () => {
    const messageSpan = screen.queryByTestId("bookmark-message");
    expect(messageSpan).not.toBeInTheDocument();
    // Ensure the close button is not in the document
    const closeButton = screen.queryByRole("button", { name: "閉じる" });
    expect(closeButton).not.toBeInTheDocument();
  });
});
