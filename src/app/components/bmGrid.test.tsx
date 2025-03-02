import "@testing-library/jest-dom";

// import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen } from "@testing-library/react";

// import BmMessage from "../components/bmMessage";
// import { MessageProvider } from "../contexts/MessageContext";
// import { BookmarkProvider } from "../contexts/BookmarkContext";
import { BmGrid } from "./bmGrid";
import { Bookmark } from "./bmRow";

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

/***
 * このテストは、Bookmarksクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * Bookmarksクラスは、ブックマークのデータを定義するクラスです。
 * Bookmarksクラスに定義されているブックマークを返します。
 **/

describe("ブックマークのデータを表示を確認", () => {
  // beforeEach(() => {
  //   fetchMock.resetMocks();
  // });

  it("ブックマークのデータを表示を確認", () => {
    // fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(<BmGrid bookmarks={mockBookmarks} />);

    const bm1 = screen.getByText("kubotama/linkpage");
    expect(bm1).toBeInTheDocument();
    expect(bm1).toHaveAttribute("href", "https://github.com/kubotama/linkpage");
    expect(bm1).toHaveAttribute("target", "_blank");

    const bm2 = screen.getByText("Google");
    expect(bm2).toBeInTheDocument();
    expect(bm2).toHaveAttribute("href", "https://www.google.com/");
    expect(bm2).toHaveAttribute("target", "_blank");

    const bm3 = screen.getByText("Gmail");
    expect(bm3).toBeInTheDocument();
    expect(bm3).toHaveAttribute("href", "https://mail.google.com");
    expect(bm3).toHaveAttribute("target", "_blank");

    const bm4 = screen.getByText("Amazon");
    expect(bm4).toBeInTheDocument();
    expect(bm4).toHaveAttribute("href", "https://www.amazon.co.jp/");
    expect(bm4).toHaveAttribute("target", "_blank");
  });

  // it("Amazonのリンクを生成するテスト", async () => {
  //   fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

  //   // render(
  //   //   <MessageProvider>
  //   //     <BmMessage />
  //   //     <BmGrid />
  //   //   </MessageProvider>
  //   // );
  //   render(
  //     <MessageProvider>
  //       <BookmarkProvider>
  //         <BmMessage />
  //         <BmGrid />
  //       </BookmarkProvider>
  //     </MessageProvider>
  //   );

  //   await waitFor(() => {
  //     const bm = screen.getByText("Amazon");
  //     expect(bm).toBeInTheDocument();
  //     expect(bm).toHaveAttribute("href", "https://www.amazon.co.jp/");
  //     expect(bm).toHaveAttribute("target", "_blank");
  //   });
  // });

  // it("ローディング中にローディングメッセージが表示されること", () => {
  //   fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする
  //   // render(
  //   //   <MessageProvider>
  //   //     <BmMessage />
  //   //     <BmGrid />
  //   //   </MessageProvider>
  //   // );
  //   render(
  //     <MessageProvider>
  //       <BookmarkProvider>
  //         <BmMessage />
  //         <BmGrid />
  //       </BookmarkProvider>
  //     </MessageProvider>
  //   );

  //   expect(screen.getByTestId("bm-message")).toHaveTextContent(/^Loading...$/);
  // });

  // it("ブックマークのフェッチに失敗した場合、エラーメッセージが表示されること", async () => {
  //   fetchMock.mockRejectOnce(new Error("Failed to fetch bookmarks"));

  //   // render(
  //   //   <MessageProvider>
  //   //     <BmMessage />
  //   //     <BmGrid />
  //   //   </MessageProvider>
  //   // );
  //   render(
  //     <MessageProvider>
  //       <BookmarkProvider>
  //         <BmMessage />
  //         <BmGrid />
  //       </BookmarkProvider>
  //     </MessageProvider>
  //   );

  //   await waitFor(() => {
  //     expect(screen.getByTestId("bm-message")).toHaveTextContent(
  //       /^Failed to fetch bookmarks$/
  //     );
  //   });
  // });

  // it("ブックマークが存在しない場合、タイトル(linkpage)が表示されること", async () => {
  //   fetchMock.mockResponseOnce(JSON.stringify([]));

  //   // render(
  //   //   <MessageProvider>
  //   //     <BmMessage />
  //   //     <BmGrid />
  //   //   </MessageProvider>
  //   // );
  //   render(
  //     <MessageProvider>
  //       <BookmarkProvider>
  //         <BmMessage />
  //         <BmGrid />
  //       </BookmarkProvider>
  //     </MessageProvider>
  //   );

  //   await waitFor(() => {
  //     expect(screen.getByTestId("bm-message")).toHaveTextContent(/^linkpage$/);
  //   });
  // });

  // it("fetchしたときにエラーコード(500)が返ってきた場合", async () => {
  //   fetchMock.mockResponseOnce("Internal Error", {
  //     status: 500,
  //     headers: { "Content-Type": "text/plain" },
  //   });

  //   // render(
  //   //   <MessageProvider>
  //   //     <BmMessage />
  //   //     <BmGrid />
  //   //   </MessageProvider>
  //   // );
  //   render(
  //     <MessageProvider>
  //       <BookmarkProvider>
  //         <BmMessage />
  //         <BmGrid />
  //       </BookmarkProvider>
  //     </MessageProvider>
  //   );

  //   await waitFor(() => {
  //     // expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  //     expect(screen.getByTestId("bm-message")).toHaveTextContent(
  //       "Failed to fetch:"
  //     );
  //   });
  // });
});
