// Supabase Edge Function: Store Waitlist Email with Encryption
// This function receives an email, encrypts it server-side, and stores it in the database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Encryption key - IMPORTANT: Store this as a Supabase secret, not in code!
// Set it in Supabase Dashboard: Project Settings > Edge Functions > Secrets
// Name: ENCRYPTION_KEY
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY') || '';

// Simple encryption using Web Crypto API (AES-GCM)
async function encryptEmail(email: string, key: string): Promise<string> {
    if (!key) {
        throw new Error('Encryption key not configured');
    }

    const encoder = new TextEncoder();

    // Convert hex string to bytes (your key is hex)
    // If key is hex, convert it; otherwise use as-is and hash to 32 bytes
    let keyData: Uint8Array;
    if (/^[0-9a-fA-F]+$/.test(key) && key.length === 64) {
        // Key is hex (64 chars = 32 bytes)
        keyData = new Uint8Array(key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    } else {
        // Key is not hex, derive 32 bytes using SHA-256
        const keyHash = await crypto.subtle.digest('SHA-256', encoder.encode(key));
        keyData = new Uint8Array(keyHash);
    }

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(email)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Base64 encode - convert Uint8Array to string then encode
    const binaryString = Array.from(combined, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
}

// Create a hash for duplicate detection (SHA-256)
async function hashEmail(email: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        // Get Supabase client with service role key (bypasses RLS)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase configuration missing');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request body
        const { email } = await req.json();

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return new Response(
                JSON.stringify({ error: 'Invalid email address' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check for duplicates
        const emailHash = await hashEmail(normalizedEmail);
        const { data: existing } = await supabase
            .from('waitlist_emails')
            .select('id')
            .eq('email_hash', emailHash)
            .single();

        if (existing) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Email already registered',
                    duplicate: true
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        // Encrypt the email
        let encryptedEmail: string;
        try {
            encryptedEmail = await encryptEmail(normalizedEmail, ENCRYPTION_KEY);
        } catch (encryptError) {
            console.error('Encryption error:', encryptError);
            throw new Error(`Encryption failed: ${encryptError.message}`);
        }

        // Store in database
        const { error: insertError } = await supabase
            .from('waitlist_emails')
            .insert({
                email_encrypted: encryptedEmail,
                email_hash: emailHash,
            });

        if (insertError) {
            console.error('Database error:', insertError);
            throw new Error('Failed to store email');
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email stored successfully'
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            encryptionKeySet: !!ENCRYPTION_KEY,
            supabaseUrlSet: !!Deno.env.get('SUPABASE_URL'),
            serviceKeySet: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        });
        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
});

