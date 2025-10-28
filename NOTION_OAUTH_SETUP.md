# Notion OAuth Setup Guide

This guide will walk you through setting up Notion OAuth for the Daily Photo app.

## Step 1: Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration" or "+ Create new integration"
3. Choose **Public integration** (not Internal)
4. Fill in the details:
   - **Name**: Daily Photo (or whatever you prefer)
   - **Logo**: Optional
   - **Associated workspace**: Select your workspace
5. Click "Submit"

## Step 2: Configure OAuth Settings

After creating the integration, you'll see your integration's settings page:

1. **Copy your credentials**:
   - Copy the **OAuth client ID**
   - Copy the **OAuth client secret** (keep this secret!)

2. **Add Redirect URI**:
   - In the "Redirect URIs" section, add your redirect URI
   - For Expo development: Use the URI shown when you run the app, typically:
     - `dailyphoto://` (for production builds)
     - For Expo Go during development, you might need to use an Expo-generated URI
   - Click "Add URI" to save it

3. **Configure Capabilities**:
   - Under "Capabilities", ensure these are enabled:
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content

4. **User Capabilities**:
   - No specific user capabilities are required unless you want to access user info

## Step 3: Set Up Your Database

1. Create a database in Notion (or use an existing one)
2. Make sure your database has these properties:
   - **Caption** (Title property)
   - **Photo** (Files property)
3. Get the database ID from the URL:
   - URL format: `https://www.notion.so/workspace/DATABASE_ID?v=...`
   - Copy the `DATABASE_ID` part

## Step 4: Configure Your App

1. Copy the example config file:
   ```bash
   cp constants/config.example.ts constants/config.ts
   ```

2. Edit `constants/config.ts` and fill in your values:
   ```typescript
   export const config = {
       // OAuth Configuration
       notionClientId: "YOUR_CLIENT_ID",        // From Step 2
       notionClientSecret: "YOUR_CLIENT_SECRET", // From Step 2
       appScheme: "dailyphoto",                  // Keep as is (matches app.json)
       databaseId: "YOUR_DATABASE_ID",           // From Step 3

       // Legacy token (can be left as is, won't be used with OAuth)
       notionToken: "ntn_TODO",
   };
   ```

## Step 5: Understanding the Redirect URI

The redirect URI is crucial for OAuth to work. Here's what you need to know:

### For Development (Expo Go):
When using Expo Go during development, Expo generates a special redirect URI. You can find it by:
1. Running your app with `npm start`
2. Looking at the console output for the redirect URI
3. Adding that URI to your Notion integration settings

### For Production Builds:
The redirect URI will be: `dailyphoto://`

Make sure this is added to your Notion integration's allowed redirect URIs.

## Step 6: Share Your Database with the Integration

IMPORTANT: After a user signs in via OAuth, they'll need to share their database with your integration:

1. Open your Notion database
2. Click the "..." menu in the top right
3. Scroll to "Connections" and click "Add connection"
4. Search for your integration name (e.g., "Daily Photo")
5. Click to add the connection

Alternatively, users can do this when prompted after their first sign-in.

## Step 7: Test the OAuth Flow

1. Run your app:
   ```bash
   npm start
   ```

2. Navigate to the Settings page in your app

3. Click "Sign in with Notion"

4. You should be redirected to Notion's authorization page

5. Grant access to your workspace

6. You should be redirected back to your app

7. The Settings page should now show you're signed in

## Troubleshooting

### "Invalid redirect URI" error
- Make sure the redirect URI in your Notion integration settings EXACTLY matches the one your app is using
- Check the console logs for the actual redirect URI being used

### "Authentication Error" after signing in
- Check that your client ID and client secret are correct
- Ensure you're using a Public integration, not an Internal one
- Check the console logs for more detailed error messages

### "Failed to upload photo" error
- Make sure you've shared your database with the integration (Step 6)
- Verify that your database ID is correct
- Check that your database has the required properties (Caption and Photo)

### Expo Go shows different redirect URI
- This is normal during development
- Copy the redirect URI from the console and add it to your Notion integration settings
- For production builds, use `dailyphoto://`

## Security Notes

1. **Never commit your `config.ts` file to version control**
   - It contains your client secret
   - Add it to `.gitignore`

2. **Keep your client secret secure**
   - Don't share it publicly
   - Don't include it in client-side code in production
   - Consider using environment variables or a secure backend for production apps

3. **Tokens are stored securely**
   - The app uses Expo SecureStore to store OAuth tokens
   - Tokens are encrypted on the device

## Need Help?

If you run into issues:
1. Check the console logs for detailed error messages
2. Verify all configuration values are correct
3. Make sure the database is shared with your integration
4. Try signing out and signing in again
