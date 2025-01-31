type Tags = [] | string[];
type Boolmark = { url: string; title: string; tags: Tags };
export const BMData = (tag: string): Boolmark[] | [] => {
  if (tag === "") return [];
  if (tag === "github") {
    return [
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
        tags: ["github"],
      },
    ];
  }
  if (tag === "google") {
    return [
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
  }
  return [];
};
