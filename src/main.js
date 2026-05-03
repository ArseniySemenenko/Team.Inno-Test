// DOM elements
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const theme_button = document.getElementById("theme_button");


//every div thet use theme
const containers = document.getElementsByClassName("themeContainer");
//true - light, false - black (for new elements)
let theme = true;

// API URL for search
const API_URL = 'https://openlibrary.org/search.json';


let debSearch = debounce(performSearch, 500);
searchInput.addEventListener('input', debSearch);

theme_button.addEventListener('click', switchTheme);

function debounce(callee, timeoutMs) {
  return function perform(...args) {
    let previousCall = this.lastCall

    this.lastCall = Date.now()

    if (previousCall && this.lastCall - previousCall <= timeoutMs) {
      clearTimeout(this.lastCallTimer)
    }

    this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs)
  }
}

function switchTheme() {
  for (let i of containers) {
    //toggle theme classes
    i.classList.toggle("light");
    i.classList.toggle("black");
  }
  theme = !theme; //toggle theme for new elements
}

async function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
      resultsContainer.innerHTML = `
          <div class="no_results" style="grid-column: 1/-1;">
              <div><h1>Void Input</h1></div>
          </div>
      `;
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

  const book_id = {
    cover: coverUrl,
    title: truncatedTitle.replaceAll(" " , "_"),
    author: author.replaceAll(" " , "_"),
    year:year,
  }

  const book_id_str = JSON.stringify(book_id);
  console.log(book_id_str);
  
    //Create HTML of book card
    card.innerHTML = `
        <div class="book_cover">
            <div class="favSelector favSwitcher ${fav.includes(book_id_str)?"active":"unactive"}" id=${book_id_str}>
            </div>
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

function displayFavs(arr) {
  favList.innerHTML = '';
  arr && arr.forEach(elem => {
    favList.appendChild(createFav(elem));
  });
}

//Fav list
let favList = document.getElementById("favList");

//Favourites list
let fav = JSON.parse(localStorage.getItem("fav_list")) || [];
displayFavs(fav);


document.addEventListener('click', (e) => {
  if (e.target.classList.contains("favSwitcher")) {
    if (fav.includes(e.target.getAttribute("id"))) {
      let elem = document.getElementById(e.target.getAttribute("id"));
      elem.classList.toggle("unactive");
      elem.classList.toggle("active");
      //fav.delete(e.target.getAttribute("id"));
      fav = fav.filter(elem => elem != e.target.getAttribute("id"));
      console.log(fav);
      localStorage.setItem('fav_list', JSON.stringify(fav));
      displayFavs(fav);
    }
    else {
      fav.push(e.target.getAttribute("id"));
      let elem = document.getElementById(e.target.getAttribute("id"));
      elem.classList.toggle("unactive");
      elem.classList.toggle("active");
      console.log(fav);
      localStorage.setItem('fav_list', JSON.stringify(fav));
      displayFavs(fav);
    }
  }
});

function createFav(elem) {
  const newFav = document.createElement('div');
  const obj = JSON.parse(elem);
  newFav.className = "favElem";
  newFav.className = "themeContainer";
  newFav.className = "light";
  console.log(obj.cover);
  newFav.innerHTML = `
    <div class="favElem themeContainer ${theme?"light":"black"}">
      <div class="fav_elem_img" >
      ${obj.cover 
          ? `<img height="120" width="70" src="${obj.cover}" alt="${obj.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23667eea\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'white\' font-size=\'14\'%3ENo Cover%3C/text%3E%3C/svg%3E'">` 
          : `<div class="fav_no_cover" ><p>No Cover Available</p></div>`
      }
      </div>
      <div class="fav_elem_text">
        <h3 class="fav_elem_title">${obj.title.replaceAll("_" , " ")}</h3>
        <h5 class="fav_elem_author">${obj.author.replaceAll("_" , " ")}</h5>
        <h5 class="fav_elem_year">Published: ${obj.year}</h5>
      </div>
      <div class="fav_elem_action">
        <div class="fav_elem_selector favSwitcher ${fav.includes(elem)?"active":"unactive"}" id=${elem}>
      </div>
      </div>
    </div>
    `;
  return newFav;
}




//modal

let favListModal = document.getElementById("favListModal");

function displayFavsModal(arr) {
  favListModal.innerHTML = '';
  arr && arr.forEach(elem => {
    favListModal.appendChild(createFav(elem));
  });
}

let fav_button = document.getElementById("fav_button");
let modal = document.getElementById("modal");
fav_button.addEventListener('click', function () {
  modal.style.display = "flex";
  displayFavsModal(fav);
});

modal.addEventListener('click', function (e) {
  if (e.target.getAttribute("id") == "modal") {
    modal.style.display = "none";
  }
});




