// Simple Movie Rating App - client side only (localStorage)
// Data model in localStorage: movies = [{id, title, ratings: [1..5]}]

const STORAGE_KEY = 'movie_ratings_v1';

function uid() {
  // simple id generator
  return 'm_' + Date.now().toString(36) + Math.floor(Math.random()*1000).toString(36);
}

function loadMovies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load movies', e);
    return [];
  }
}

function saveMovies(movies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function calcStats(movie) {
  const count = (movie.ratings || []).length;
  const sum = (movie.ratings || []).reduce((a,b)=>a+b,0);
  const avg = count ? (sum / count) : 0;
  // Round to 2 decimal places for display
  const avgRounded = Math.round(avg * 100) / 100;
  return {count, avg: avgRounded};
}

function createStarButton(value, currentAvg, onClick) {
  const btn = document.createElement('button');
  btn.className = 'star-btn';
  btn.setAttribute('data-value', value);
  btn.type = 'button';
  btn.title = `${value} star${value>1?'s':''}`;
  btn.innerHTML = '★';
  // Visual logic: highlight if value <= Math.round(currentAvg)
  if (value <= Math.round(currentAvg)) btn.classList.add('star-filled');
  btn.addEventListener('click', (e) => onClick(value));
  return btn;
}

function renderMovies() {
  const list = document.getElementById('moviesList');
  list.innerHTML = '';
  const movies = loadMovies();

  if (movies.length === 0) {
    list.innerHTML = `<div style="padding:18px;background:#fff;border-radius:10px;text-align:center;color:#6b7280">No movies yet — add one above!</div>`;
    return;
  }

  const template = document.getElementById('movieTemplate');
  movies.forEach(movie => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.movie-card');
    const titleEl = node.querySelector('.movie-title');
    const editBtn = node.querySelector('.edit-btn');
    const delBtn = node.querySelector('.delete-btn');
    const starsEl = node.querySelector('.stars');
    const avgVal = node.querySelector('.avg-val');
    const countVal = node.querySelector('.count-val');

    titleEl.textContent = movie.title;

    const stats = calcStats(movie);
    avgVal.textContent = stats.avg;
    countVal.textContent = stats.count;

    // create 5 star buttons
    starsEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const starBtn = createStarButton(i, stats.avg, (value) => {
        handleRate(movie.id, value);
      });
      starsEl.appendChild(starBtn);
    }

    // delete
    delBtn.addEventListener('click', () => {
      if (!confirm(`Delete "${movie.title}"? This will remove all ratings.`)) return;
      const updated = loadMovies().filter(m => m.id !== movie.id);
      saveMovies(updated);
      renderMovies();
    });

    // edit title
    editBtn.addEventListener('click', () => {
      const newTitle = prompt('Edit movie title', movie.title);
      if (!newTitle) return;
      const moviesList = loadMovies();
      const idx = moviesList.findIndex(m => m.id === movie.id);
      if (idx >= 0) {
        moviesList[idx].title = newTitle.trim();
        saveMovies(moviesList);
        renderMovies();
      }
    });

    list.appendChild(node);
  });
}

function handleRate(movieId, value) {
  const movies = loadMovies();
  const idx = movies.findIndex(m => m.id === movieId);
  if (idx < 0) return;
  movies[idx].ratings = movies[idx].ratings || [];
  movies[idx].ratings.push(value);
  saveMovies(movies);
  renderMovies();
}

// initial add movie
document.getElementById('addBtn').addEventListener('click', () => {
  const titleInput = document.getElementById('movieTitle');
  const title = titleInput.value.trim();
  if (!title) {
    alert('Please enter a movie title.');
    return;
  }
  const movies = loadMovies();
  // optional: prevent duplicate titles (case-insensitive)
  const exists = movies.some(m => m.title.toLowerCase() === title.toLowerCase());
  if (exists) {
    if (!confirm('A movie with that title already exists. Add duplicate?')) return;
  }
  const newMovie = { id: uid(), title, ratings: [] };
  movies.unshift(newMovie); // newest first
  saveMovies(movies);
  titleInput.value = '';
  renderMovies();
});

// allow pressing Enter to add
document.getElementById('movieTitle').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

renderMovies();
