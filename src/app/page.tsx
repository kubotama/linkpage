import { Bookmarks } from "./components/bookmark";

export default function Home() {
  const bookmarks = Bookmarks();
  return (
    <div>
      <div>linkpage</div>
      <div className="grid grid-cols-1">
        {bookmarks.map((bookmark, index) => (
          <div className="grid-item" key={index}>
            <a href={bookmark.url} target="_blank">
              {bookmark.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
