// ===========================
// APP.JS — The librarian (Supabase edition)
// ===========================
// Same job as before — save, load, delete entries —
// but now talking to your real Supabase database
// instead of the browser's localStorage.

const typeEmoji = { note: '📝', blog: '✍️', link: '🔗', photo: '📷' };

// --- Save a new entry ---
async function saveEntry(entry) {
  const { error } = await db
    .from('entries')
    .insert({
      title:     entry.title,
      type:      entry.type,
      content:   entry.content  || '',
      url:       entry.url      || '',
      has_photo: entry.hasPhoto || false,
      tags:      entry.tags ? entry.tags.join(',') : '',
      date:      entry.date
    });

  if (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
}

// --- Get all entries (newest first) ---
async function getEntries() {
  const { data, error } = await db
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading entries:', error);
    return [];
  }

  // Convert from Supabase format to our app format
return data.map(row => ({
  id:        row.id,
  title:     row.title,
  type:      row.type,
  content:   row.content,
  url:       row.url,
  hasPhoto:  row.has_photo,
  photoPath: row.photo_path,   // ✅ ADD THIS
  tags:      row.tags ? row.tags.split(',').filter(t => t !== '') : [],
  date:      row.date
}));
}

// --- Delete an entry ---
async function deleteEntry(id) {
  // Delete the photo from storage first (if it has one)
  await deletePhoto(id);

  const { error } = await db
    .from('entries')
    .delete()
    .eq('id', id);  // "where id equals this value"

  if (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
}

// ===========================
// RENDER CARDS ON HOMEPAGE
// ===========================
async function renderCards(entriesToShow) {
  const grid       = document.getElementById('entriesGrid');
  const emptyState = document.getElementById('emptyState');
  if (!grid) return;

  if (!entriesToShow || entriesToShow.length === 0) {
    const all = await getEntries();
    if (all.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    grid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1;
      text-align:center; padding:2rem; font-style:italic;">
      No entries match your search.</p>`;
    return;
  }

  emptyState.style.display = 'none';

  // Render cards immediately with placeholders for photos
  grid.innerHTML = entriesToShow.map(entry => `
    <a href="view.html?id=${entry.id}" class="entry-card">
      ${entry.hasPhoto
        ? `<div class="card-photo-placeholder" id="photo-${entry.id}">
             <span class="photo-loading">🖼️</span>
           </div>`
        : ''}
      <div class="card-type">${typeEmoji[entry.type] || '📄'} ${entry.type}</div>
      <div class="card-title">${entry.title}</div>
      ${entry.content
        ? `<div class="card-preview">${entry.content}</div>`
        : ''}
      ${entry.url
        ? `<div class="card-preview" style="color:var(--accent-2)">🔗 ${entry.url}</div>`
        : ''}
      <div class="card-footer">
        <span class="card-date">${entry.date}</span>
        ${entry.tags && entry.tags.length > 0
          ? `<div class="card-tags">
               ${entry.tags.slice(0,2).map(t => `<span class="tag">#${t}</span>`).join('')}
             </div>`
          : ''}
      </div>
    </a>
  `).join('');

  // Load photos in background — they pop in when ready
  for (const entry of entriesToShow) {
    if (!entry.hasPhoto) continue;
    const url = getPhotoUrlFromPath(entry.photoPath);
    const placeholder = document.getElementById(`photo-${entry.id}`);
    if (url && placeholder) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = entry.title;
      img.className = 'card-photo';
      img.onerror = () => placeholder.remove();
      placeholder.replaceWith(img);
    }
  }
}

// ===========================
// FILTER + SEARCH
// ===========================
let activeFilter  = 'all';
let allEntries    = [];

function filterBySearch(entries, term) {
  return entries.filter(e =>
    e.title.toLowerCase().includes(term) ||
    (e.content && e.content.toLowerCase().includes(term)) ||
    (e.tags && e.tags.some(t => t.includes(term))) ||
    (e.url && e.url.toLowerCase().includes(term))
  );
}

function applyFilterAndSearch() {
  let results = allEntries;
  if (activeFilter !== 'all') {
    results = results.filter(e => e.type === activeFilter);
  }
  const term = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  if (term) results = filterBySearch(results, term);
  renderCards(results);
}

// ===========================
// INIT ON HOMEPAGE
// ===========================
document.addEventListener('DOMContentLoaded', async function () {
  const grid = document.getElementById('entriesGrid');
  if (!grid) return; // not on homepage

  // Show loading state
  grid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1;
    text-align:center; padding:2rem; font-style:italic;">
    ⏳ Loading your archive...</p>`;

  allEntries = await getEntries();
  renderCards(allEntries);

  // Filter buttons
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeFilter = this.dataset.filter;
      applyFilterAndSearch();
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilterAndSearch);
  }
});
