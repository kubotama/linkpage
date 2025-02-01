type Tags = string[];
type Boolmark = { url: string; title: string; tags: Tags };

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
    tags: ["google"],
  },
];

export const Bookmarks = (tag: string): Boolmark[] => {
  return bookmarks.filter((bookmark) => bookmark.tags.includes(tag));
};
