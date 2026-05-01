// DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('resultsContainer');
const theme_button = document.getElementById("theme_button");

//every div thet use theme
const containers = document.getElementsByClassName("themeContainer");
//true - light, false - black
let theme = true;

// API URL for search
const API_URL = 'https://openlibrary.org/search.json';

//EventListeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});
theme_button.addEventListener('click', switchTheme);

//Remove side "Favourites" bar when windows width < 800
//and add back when width > 800
window.addEventListener('resize', function(){ 
  let width = window.innerWidth;
  let favContainer = document.getElementById("favContainer");
  if (width < 800) {
    if(favContainer) favContainer.style.display = "none";
  } else {
    if (favContainer) favContainer.style.display = "block";
  }
});


function switchTheme() {
  for (let i of containers) {
    //toggle theme classes
    i.classList.toggle("light");
    i.classList.toggle("black");
  }
  theme = !theme; //theme for new elements
}

async function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a book title or author name');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&limit=20`);
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        if (data.docs && data.docs.length > 0) {
            displayBooks(data.docs);
        } else {
            showNoResults(query);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load books. Please try again later.');
    }
}


function displayBooks(books) {
    resultsContainer.innerHTML = '';
    books.forEach(book => {
        const bookCard = createBookCard(book);
        resultsContainer.appendChild(bookCard);
    });
}

function createBookCard(book) {
  const card = document.createElement('div');
  card.className = "themeContainer";
  card.className = "light";
  card.className = 'book_card';
    
    //Book cover
    const coverId = book.cover_i;
    const coverUrl = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null;
    
    //Title (lenght < 50)
    const title = book.title || 'Unknown Title';
    const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
    
    //Authors
    const authors = book.author_name || ['Unknown Author'];
    const author = authors[0];
    
    //Publication year
    const year = book.first_publish_year || '';
    
    //Create HTML of book card
    card.innerHTML = `
        <div class="book_cover">
            
            ${coverUrl 
                ? `<img src="${coverUrl}" alt="${truncatedTitle}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23667eea\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'white\' font-size=\'14\'%3ENo Cover%3C/text%3E%3C/svg%3E'">` 
                : `<div class="no_cover"><h1>No Cover Available</h1></div>`
            }
        </div>
        <div class="book_info themeContainer ${theme?"light":"black"}">
            <div class="book_title">${escapeHtml(truncatedTitle)}</div>
            <div class="book_author">${escapeHtml(author)}</div>
            ${year ? `<div class="book_year">Published: ${year}</div>` : ''}
        </div>
    `;
  return card;
}

function showLoading() {
    resultsContainer.innerHTML = `
        <div class="loading" style="grid-column: 1/-1;">
            <div><h1>Searching...</h1></div>
            <div style="margin-top: 10px;"></div>
        </div>
    `;
}

function showNoResults(query) {
    resultsContainer.innerHTML = `
        <div class="no_results" style="grid-column: 1/-1;">
            <div><h1>No books found for "${escapeHtml(query)}"</h1></div>
        </div>
    `;
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="error" style="grid-column: 1/-1;">
            <div><h1>${escapeHtml(message)}</h1></div>
        </div>
    `;
}

//HTML special symbols
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function loadPopularBooks() {
    showLoading();
    
    try {
        const response = await fetch('https://openlibrary.org/search.json?q=fiction&limit=12&sort=rating');
        
        if (!response.ok) {
            throw new Error('Failed to load popular books');
        }
        
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0) {
            displayBooks(data.docs);
        } else {
            resultsContainer.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Error loading popular books:', error);
        resultsContainer.innerHTML = '';
    }
}

//Load books at start
loadPopularBooks();

