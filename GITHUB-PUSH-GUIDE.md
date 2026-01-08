# Safe GitHub Push Guide

## ⚠️ Security Check Before Pushing

### ✅ Safe to Commit:
- `config.js` - Contains **anon key** (publishable, safe for client-side)
- All code files
- Images and assets
- Database migration SQL (schema only, no data)

### ❌ Never Commit:
- Service Role Keys (secret keys)
- Encryption keys (stored as Supabase secrets)
- `.env` files
- Any actual user data

## Current Status

Your `config.js` contains:
- ✅ Supabase URL (safe)
- ✅ Anon Key (publishable, safe - protected by RLS)

**These are safe to commit** because:
- Anon keys are designed for client-side use
- Protected by Row Level Security (RLS)
- Not secret keys

## Steps to Push Safely

### 1. Review What Will Be Committed

```bash
git status
```

### 2. Add Files to Staging

```bash
# Add all files (safe - .gitignore will exclude secrets)
git add .

# Or add specific files:
git add index.html main.js styles.css config.js .gitignore README.md
git add supabase-migration.sql supabase/
git add cynra-logo.png cynra-favicon.png.png
```

### 3. Review Changes Before Committing

```bash
# See what will be committed
git status

# Preview changes
git diff --staged
```

### 4. Commit with a Clear Message

```bash
git commit -m "Add Cynra waitlist with Supabase encrypted email storage"
```

### 5. Push to GitHub

```bash
# If this is your first push to a new repo:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main

# If repo already exists:
git push
```

## Optional: Make Config Template-Only

If you want extra security, you can:

1. **Rename config.js to config.example.js** (already created)
2. **Add config.js to .gitignore**
3. **Document that users need to create their own config.js**

This way, each developer/deployment needs to provide their own Supabase credentials.

## Verify After Push

1. Go to your GitHub repo
2. Check that `config.js` is there (it's safe)
3. Verify `.gitignore` is working (no `.env` files visible)
4. Confirm no service role keys are visible

## If You Accidentally Committed Secrets

If you ever commit a secret key:

1. **Immediately rotate the key** in Supabase Dashboard
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch config.js" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (only if necessary and you understand the risks)

## Best Practices Going Forward

- ✅ Always use `.gitignore` for secrets
- ✅ Use Supabase secrets for Edge Functions (not in code)
- ✅ Review `git diff` before committing
- ✅ Use environment variables for sensitive config in production
- ✅ Rotate keys if accidentally exposed

