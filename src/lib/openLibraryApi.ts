import { Book } from './types';

type OLDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  number_of_pages_median?: number;
  ratings_average?: number;
  ratings_count?: number;
  want_to_read_count?: number;
  already_read_count?: number;
};

type OLSearchResponse = {
  docs: OLDoc[];
  numFound: number;
};

const FIELDS = 'key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,ratings_average,ratings_count,want_to_read_count,already_read_count';

function getCoverUrl(coverId: number) {
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function olDocToBook(doc: OLDoc): Book {
  return {
    id: doc.key.replace('/works/', ''),
    title: doc.title,
    author: doc.author_name?.[0] ?? 'Unknown Author',
    coverUrl: doc.cover_i ? getCoverUrl(doc.cover_i) : undefined,
    year: doc.first_publish_year,
    subjects: doc.subject?.slice(0, 5),
    pages: doc.number_of_pages_median,
  };
}

/** Fetch a single book by its OL work ID (e.g. "OL17930368W") */
export async function fetchBookById(id: string): Promise<Book | null> {
  try {
    const [workRes, ratingsRes] = await Promise.all([
      fetch(`https://openlibrary.org/works/${id}.json`),
      fetch(`https://openlibrary.org/works/${id}/ratings.json`),
    ]);
    if (!workRes.ok) return null;
    const work = await workRes.json();

    // Resolve author name
    let author = 'Unknown Author';
    const authorKey = work.authors?.[0]?.author?.key;
    if (authorKey) {
      const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
      if (authorRes.ok) {
        const authorData = await authorRes.json();
        author = authorData.name ?? author;
      }
    }

    // Description can be a string or { type, value } object
    const description =
      typeof work.description === 'string'
        ? work.description
        : work.description?.value ?? undefined;

    const coverId: number | undefined = work.covers?.[0];
    const subjects: string[] = (work.subjects ?? []).slice(0, 5);

    return {
      id,
      title: work.title,
      author,
      coverUrl: coverId ? getCoverUrl(coverId) : undefined,
      description,
      subjects,
    };
  } catch {
    return null;
  }
}

/** General keyword search — used in the search bar */
export async function searchBooks(query: string): Promise<Book[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed');
  const data: OLSearchResponse = await res.json();
  return data.docs.map(olDocToBook);
}

/**
 * Fetch top books for a subject, sorted by reading-log activity (want-to-read +
 * already-read counts) — the best Open Library proxy for "most talked about".
 * Falls back to editions sort if readinglog yields too few covers.
 */
export async function fetchTopBySubject(subject: string, limit = 12): Promise<Book[]> {
  const url = `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&sort=readinglog&limit=${limit}&fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch top books');
  const data: OLSearchResponse = await res.json();
  // Prefer books that have a cover and a decent readership signal
  const books = data.docs.map(olDocToBook);
  return books;
}
