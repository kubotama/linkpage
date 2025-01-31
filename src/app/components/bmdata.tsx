type Tags = [] | [string];
type Boolmark = { url: string; title: string; tags: Tags };
export const BMData = (tag: string): [Boolmark] | [] => {
  if (tag === "") return [];
  return [];
};
