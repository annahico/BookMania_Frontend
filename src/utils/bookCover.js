export const getBookCover = async (isbn) => {
  if (!isbn) return null;
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
    return null;
  }
};