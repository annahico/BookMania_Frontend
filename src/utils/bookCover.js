// Module-level cache: covers rarely change, so once we've resolved one for
// an ISBN there's no reason to hit the Google Books API again for it —
// every page/search re-render was refetching the same covers over and over.
// Caching the in-flight promise (not just the resolved value) also
// de-duplicates concurrent requests for the same ISBN (e.g. the same book
// appearing in two lists rendered at once).
const coverCache = new Map();

export const getBookCover = async (isbn) => {
  if (!isbn) return null;

  if (coverCache.has(isbn)) {
    return coverCache.get(isbn);
  }

  const promise = (async () => {
    try {
      const cleanIsbn = isbn.replace(/-/g, "");
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
      );
      const data = await response.json();
      const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (!thumbnail) return null;
      return thumbnail.replace("zoom=1", "zoom=2").replace("http://", "https://");
    } catch {
      // Don't cache failures — a transient network error shouldn't
      // permanently deny this ISBN a cover for the rest of the session.
      coverCache.delete(isbn);
      return null;
    }
  })();

  coverCache.set(isbn, promise);
  return promise;
};
