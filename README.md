# Cynra Website

AI-driven market analytics engine for modern traders.

## Setup

1. Update `config.js` with your Supabase credentials
2. Run `supabase-migration.sql` in your Supabase SQL Editor
3. Deploy the Edge Function: `supabase functions deploy store-waitlist-email`
4. Set Edge Function secrets in Supabase Dashboard

## Files

- `index.html` - Main page
- `main.js` - Site logic and Supabase integration
- `styles.css` - Styling
- `config.js` - Supabase configuration
- `supabase-migration.sql` - Database schema
- `supabase/functions/store-waitlist-email/` - Edge Function for encrypted email storage

