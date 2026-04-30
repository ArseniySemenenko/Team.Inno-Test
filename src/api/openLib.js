const API_BASE_URL = 'https://openlibrary.org/search.json';

/**
 * Search for books by query
 * @param {string} query - Search term (title, author, or keyword)
 * @returns {Promise<Array>} - Array of formatted book objects
 */
export async function searchBooks(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `${API_BASE_URL}?q=${encodedQuery}&limit=24`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.docs || data.docs.length === 0) {
    return [];
  }
  
  // Format and deduplicate books by key
  const booksMap = new Map();
  
  data.docs.forEach(doc => {
    const bookKey = doc.key || `edition_${doc.edition_key?.[0] || doc.cover_i || Date.now()}_${doc.title}`;
    
    if (!booksMap.has(bookKey)) {
      booksMap.set(bookKey, {
        id: bookKey,
        key: bookKey,
        title: doc.title || 'Unknown Title',
        author_name: doc.author_name || ['Unknown Author'],
        first_publish_year: doc.first_publish_year || doc.publish_year?.[0] || 'Unknown',
        cover_i: doc.cover_i || null,
        author_key: doc.author_key || []
      });
    }
  });
  
  return Array.from(booksMap.values());
}

/**
 * Get cover image URL
 * @param {number} coverId - Cover ID from Open Library
 * @returns {string|null} - Cover URL or null if no cover
 */
export function getCoverUrl(coverId) {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}