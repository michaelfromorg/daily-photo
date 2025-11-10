# Daily Photo

A mini BeReal replacement (without any social features) that uploads a photo-a-day to Notion.

## Features

- 📸 Take daily photos with front or back camera
- 📝 Add captions to your photos
- 🗂️ Automatically upload to Notion database
- 📅 Daily notification reminders (at random times between 9 AM - 9 PM)
- 🎲 Notification time changes automatically after each photo (keeps it unpredictable!)
- 🔒 Secure OAuth authentication

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- Expo CLI
- A Notion account
- A Vercel account (for hosting the OAuth backend)

## Setup Instructions

### 1. Create a Notion Public Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Set the integration type to **"Public"** (important!)
4. Give it a name (e.g., "Daily Photo")
5. Select capabilities:
   - Read content
   - Update content
   - Insert content
6. Click "Submit"
7. Save your **OAuth client ID** and **OAuth client secret** (you'll need these later)

### 2. Create a Notion Database

1. In Notion, create a new database (table view works well)
2. Add these properties:
   - **Caption** (Title) - for the photo caption
   - **Photo** (Files & media) - for the photo
3. Copy the database ID from the URL:
   - URL format: `https://www.notion.so/workspace/DATABASE_ID?v=...`
   - Save the `DATABASE_ID` for later

### 3. Deploy the Backend to Vercel

The backend handles OAuth token exchange securely (keeping your client secret safe).

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Deploy the backend:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Choose your account
   - Link to existing project? **No**
   - Project name? Use default or choose your own
   - Directory? `.` (current directory)
   - Override settings? **No**

4. After deployment, Vercel will give you a URL like: `https://your-project.vercel.app`

5. Set environment variables in Vercel:
   ```bash
   vercel env add NOTION_CLIENT_ID
   vercel env add NOTION_CLIENT_SECRET
   vercel env add NOTION_REDIRECT_URI
   ```

   Or via the Vercel dashboard:
   - Go to your project settings → Environment Variables
   - Add:
     - `NOTION_CLIENT_ID`: Your Notion OAuth client ID
     - `NOTION_CLIENT_SECRET`: Your Notion OAuth client secret
     - `NOTION_REDIRECT_URI`: `https://your-project.vercel.app/api/notion-callback`

6. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### 4. Configure Notion Redirect URI

1. Go back to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Select your integration
3. Under "Redirect URIs", add:
   ```
   https://your-project.vercel.app/api/notion-callback
   ```
4. Save changes

### 5. Configure the Mobile App

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add:
   ```
   EXPO_PUBLIC_NOTION_CLIENT_ID=your_notion_client_id
   EXPO_PUBLIC_BACKEND_URL=https://your-project.vercel.app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### 6. Share Your Database with the Integration

After authenticating via OAuth:
1. Open your Notion database
2. Click "..." menu → "Connections"
3. Search for your integration name
4. Click to connect

## Development

### Start the Development Server

```bash
npm start
```

This will start the Expo development server with tunnel mode enabled.

### Run on Specific Platforms

```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web
```

### Test Notion Upload (CLI)

You can test the Notion upload functionality without running the mobile app:

```bash
npm run test-upload
```

This script uploads a test image from `images/bereal.png` to your Notion database.

## Project Structure

```
daily-photo/
├── api/                    # Vercel serverless functions
│   └── notion-callback.ts  # OAuth callback handler
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with auth
│   ├── index.tsx          # Camera screen
│   ├── login.tsx          # OAuth login screen
│   ├── settings.tsx       # Settings & logout
│   └── oauth/
│       └── callback.tsx   # OAuth redirect handler
├── lib/                   # Core business logic
│   ├── notion.ts          # Notion API integration
│   ├── notionAuth.ts      # OAuth hook
│   ├── notifications.ts   # Daily notifications
│   └── storage.ts         # SecureStore helpers
├── constants/
│   └── config.ts          # App configuration
└── scripts/
    └── uploadToNotion.ts  # CLI upload utility
```

## How OAuth Works

1. User taps "Connect to Notion" in the app
2. App opens browser to Notion OAuth page (redirects to backend URL)
3. User authorizes the app and selects which pages to share
4. Notion redirects to the backend with an authorization code
5. Backend exchanges the code for access/refresh tokens (keeps client secret secure)
6. Backend redirects to the app via deep link (`dailynotion://oauth/callback`) with tokens
7. App stores tokens securely in device's secure storage
8. App uses tokens for all Notion API requests

## Security Notes

- Never commit `.env` files to git
- Never expose your `NOTION_CLIENT_SECRET` in the mobile app
- All OAuth token exchanges happen on the backend
- Tokens are stored in device's secure encrypted storage (`expo-secure-store`)
- The hardcoded token from the initial version has been removed

## Troubleshooting

### "No access token found" error
- Make sure you've completed the OAuth flow
- Try logging out and logging back in
- Check that environment variables are set correctly

### Backend errors
- Check Vercel logs: `vercel logs`
- Verify environment variables are set in Vercel dashboard
- Ensure redirect URI matches exactly in Notion integration settings

### Deep linking not working
- Make sure `scheme: "dailynotion"` is in `app.json`
- Rebuild the app after changing `app.json`
- Check that deep link format matches: `dailynotion://oauth/callback`

## License

Private project
