const { createClient } = require('@supabase/supabase-js');

// Extract Supabase URL and project reference from DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
let supabaseUrl = 'https://your-project.supabase.co';
let supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (databaseUrl) {
  // Extract project reference from DATABASE_URL
  const match = databaseUrl.match(/postgres\.([^.]+)\.supabase\.com/);
  if (match) {
    const projectRef = match[1];
    supabaseUrl = `https://${projectRef}.supabase.co`;
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
