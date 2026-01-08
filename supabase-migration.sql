-- Cynra Waitlist Database Migration
-- Run this SQL in your Supabase SQL Editor to create the waitlist table

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_encrypted TEXT NOT NULL,
    email_hash TEXT NOT NULL UNIQUE, -- Hash for duplicate detection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email_hash ON waitlist_emails(email_hash);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist_emails(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows INSERT for authenticated users
-- For a public waitlist, we'll use a service role key in the Edge Function instead
-- This policy allows inserts from the Edge Function
CREATE POLICY "Allow insert for service role" ON waitlist_emails
    FOR INSERT
    WITH CHECK (true);

-- Optional: Create a policy to allow SELECT for authenticated admin users
-- You can customize this based on your needs
-- CREATE POLICY "Allow select for admins" ON waitlist_emails
--     FOR SELECT
--     USING (auth.role() = 'authenticated');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_emails_updated_at
    BEFORE UPDATE ON waitlist_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

