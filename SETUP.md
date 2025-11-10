# Quick Setup Guide

Follow these steps to get OAuth working:

## Step 1: Create Notion Public Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. **Important:** Select "Public" integration type
4. Name it (e.g., "Daily Photo")
5. Copy the **OAuth client ID** and **OAuth client secret**

## Step 2: Deploy Backend to Vercel

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NOTION_CLIENT_ID
# Paste your client ID

vercel env add NOTION_CLIENT_SECRET
# Paste your client secret

vercel env add NOTION_REDIRECT_URI
# Paste: https://YOUR-PROJECT.vercel.app/api/notion-callback

# Redeploy with environment variables
vercel --prod
```

Your backend URL will be: `https://YOUR-PROJECT.vercel.app`

## Step 3: Configure Notion Redirect URI

1. Back in Notion integration settings
2. Under "Redirect URIs", add:
   ```
   https://YOUR-PROJECT.vercel.app/api/notion-callback
   ```
3. Save

## Step 4: Configure Mobile App

Create `.env` file:
```bash
EXPO_PUBLIC_NOTION_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_BACKEND_URL=https://YOUR-PROJECT.vercel.app
```

## Step 5: Test It

```bash
npm start
```

1. App will show login screen
2. Tap "Connect to Notion"
3. Browser opens to Notion OAuth
4. Authorize the app
5. You'll be redirected back to the app
6. Take a photo and upload!

## What URL to Put in Notion Form?

**Answer:** `https://YOUR-PROJECT.vercel.app/api/notion-callback`

Replace `YOUR-PROJECT` with your actual Vercel project name.

## Troubleshooting

- **Can't find .env values:** Make sure you created `.env` in the project root
- **Backend errors:** Check `vercel logs` and verify environment variables in Vercel dashboard
- **Deep link not working:** Rebuild the app after adding the scheme to app.json
- **OAuth redirect fails:** Double-check the redirect URI matches exactly in Notion settings
