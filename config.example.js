// Supabase Configuration Template
// Copy this file to config.js and fill in your actual Supabase credentials
// You can find these in your Supabase dashboard under Project Settings > API

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_PROJECT_URL', // e.g., https://xxxxx.supabase.co
    anonKey: 'YOUR_PUBLISHABLE_ANON_KEY' // Your Publishable API Key (safe for client-side)
};

// Note: The anon key is safe to use in the browser when Row Level Security (RLS) is enabled
// For production, consider using environment variables or a build-time config

