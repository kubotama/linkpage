import "@testing-library/jest-dom";

import { beforeEach, describe, it, vi } from "vitest";

import userEvent, { UserEvent } from "@testing-library/user-event";

import { ARROW_BUTTON_ROLE_NAME } from "../../constants/constants";
import { HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import {
  assertBookmarkIsSelected,
  clickBookmark,
  expectBookmarkFormValues,
  GOOGLE_BOOKMARK,
  mockBookmarks,
  mockKeywords,
  setBookmarkFormValuesAndClickButton,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";

const mockFetch = vi.fn();

describe("「←」ボタン", () => {
  let user: UserEvent;

  beforeEach(async () => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => mockBookmarks,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => mockKeywords,
    });

    user = userEvent.setup();

    await setupBookmarkManagerForTest();

    await clickBookmark(user, GOOGLE_BOOKMARK);
    await assertBookmarkIsSelected(GOOGLE_BOOKMARK);
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
    await setBookmarkFormValuesAndClickButton(user, { url }, ARROW_BUTTON_ROLE_NAME);

    await expectBookmarkFormValues({ url: expectedUrl });
  });
});
