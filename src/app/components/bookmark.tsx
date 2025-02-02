type Boolmark = { url: string; title: string; tags: string[] };

const bookmarks: Boolmark[] = [
  {
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
    tags: ["github"],
  },
  {
    url: "https://www.google.com/",
    title: "Google",
    tags: ["google"],
  },
  {
    url: "https://mail.google.com",
    title: "Gmail",
    tags: ["google", "日次"],
  },
  {
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
    tags: ["日次"],
  },
];

export const Bookmarks = (tag: string): Boolmark[] => {
  return bookmarks.filter((bookmark) => bookmark.tags.includes(tag));
};
