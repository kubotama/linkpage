import "@testing-library/jest-dom";

import { beforeEach, describe, it, vi } from "vitest";

import { ARROW_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  mockBookmarks,
  expectBookmarkFormValues,
  setBookmarkFormValuesAndClickButton,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";

const mockFetch = vi.fn();

describe("「←」ボタン", () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });

    await setupBookmarkManagerForTest();

    await clickBookmark(mockBookmarks[1]);
  });

  it.each([
    {
      url: "https://mail.google.com/mail/u/0/#inbox",
      expectedUrl: "https://mail.google.com/mail/u/#inbox",
    },
    {
      url: "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376",
      expectedUrl: "https://xtech.nikkei.com/atcl/nxt/column/18/00148/",
    },
    {
      url: "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/",
      expectedUrl: "https://xtech.nikkei.com/atcl/nxt/column/18/00148/",
    },
    {
      url: "https://xtech.nikkei.com",
      expectedUrl: "https://xtech.nikkei.com",
    },
    {
      url: "https://xtech.nikkei.com/",
      expectedUrl: "https://xtech.nikkei.com/",
    },
    {
      url: "https://xtech.nikkei.com/atcl",
      expectedUrl: "https://xtech.nikkei.com/",
    },
    {
      url: "invalid-url",
      expectedUrl: "invalid-url",
    },
  ])(" URLから、/の階層を一段、削除する: $url", async ({ url, expectedUrl }) => {
    await setBookmarkFormValuesAndClickButton({ url }, ARROW_BUTTON_ROLE_NAME);

    await expectBookmarkFormValues({ url: expectedUrl });
  });
});
