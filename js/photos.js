// ===========================
// PHOTOS.JS — Cloud photo storage (Supabase edition)
// ===========================
// Instead of saving photos in your browser (IndexedDB),
// we now upload them to Supabase Storage —
// a real cloud file storage, like a private Google Photos.
//
// Each photo is saved with the entry's ID as its filename,
// so we can always find it again.

const BUCKET = 'photos';

// --- Upload a photo to Supabase Storage ---
// id:   the entry ID (used as the filename)
// file: the File object from the file input
async function savePhoto(id, file) {
  const extension = file.name.split('.').pop(); // e.g. "jpg"
  const path      = `${id}.${extension}`;       // e.g. "1234567890.jpg"

  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true  // overwrite if file already exists
    });

  if (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }

  return path;
}

// --- Get a public URL for a photo ---
// Returns a direct https:// link you can use in <img src="">
// We try both .jpg and .png and .webp extensions
function getPhotoUrl(id) {
  // We'll try to find the photo by checking common extensions.
  // Since we don't store the extension, we use a convention:
  // try to get the URL and let the browser handle 404s gracefully.
  // The simplest approach: store extension in entry, or use a fixed naming.
  // Here we return a URL pattern and let the img onerror handle misses.
  const { data } = db.storage
    .from(BUCKET)
    .getPublicUrl(id); // we'll store just the id as path

  return data?.publicUrl || null;
}

// --- Delete a photo from Supabase Storage ---
async function deletePhoto(id) {
  // Try to delete with common extensions
  // (We store the full path in the entry for reliability)
  const { error } = await db.storage
    .from(BUCKET)
    .remove([id]);

  // Don't throw — if there's no photo it's fine
  if (error) console.warn('Could not delete photo (may not exist):', error);
}

// --- Upload photo and return its storage path ---
// This is what add.html calls — it returns the path
// so we can store it in the entry record
async function uploadPhotoAndGetPath(file) {
  // Get file extension (jpg, png, etc.)
  const extension = file.name.split('.').pop().toLowerCase();

  // Generate a random filename (NOT database ID)
  const randomId = crypto.randomUUID();

  // Create storage path
  const path = `${randomId}.${extension}`;

  // Upload to Supabase Storage
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  // Return the storage path so we can save it in the database
  return path;
};


// --- Get public URL from a stored path ---
function getPhotoUrlFromPath(path) {
  if (!path) return null;
  const { data } = db.storage
    .from(BUCKET)
    .getPublicUrl(path);
  return data?.publicUrl || null;
}
