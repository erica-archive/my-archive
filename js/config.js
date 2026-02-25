// ===========================
// CONFIG.JS — Your Supabase connection
// ===========================
// THIS IS THE ONLY FILE YOU NEED TO EDIT.
// Paste your two values from Supabase's API settings page.

const SUPABASE_URL  = 'https://yioooxntaqmotudonzbz.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb29veG50YXFtb3R1ZG9uemJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzQwMzYsImV4cCI6MjA4NzU1MDAzNn0.eZqKiLk6uFyP7j7sr2y-lbcuTGKyrxtjqYm0eMWfIrA';

// ===========================
// DO NOT EDIT BELOW THIS LINE
// ===========================
// This loads the Supabase library and creates a connection.
// Think of this like dialing a phone number — after this,
// your archive can "talk" to your Supabase database.

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
