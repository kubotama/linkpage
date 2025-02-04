import { Bookmarks } from "./components/bookmark";

export default function Home() {
  const bookmarks = Bookmarks();
  return (
    <div>
      <div>linkpage</div>
      <ul>
        {bookmarks.map((bookmark, index) => (
          <li key={index}>
            <a href={bookmark.url} target="_blank">
              {bookmark.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
