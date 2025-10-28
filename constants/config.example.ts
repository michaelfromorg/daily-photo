export const config = {
    // OAuth Configuration
    // Create an OAuth integration at https://www.notion.so/my-integrations
    // Select "Public integration" and add your redirect URI
    notionClientId: "YOUR_CLIENT_ID",
    notionClientSecret: "YOUR_CLIENT_SECRET",

    // App scheme for deep linking (change this to your app's unique scheme)
    // In app.json, add: "scheme": "dailyphoto"
    appScheme: "dailyphoto",

    // Get this from your database URL
    // https://www.notion.so/yourworkspace/DATABASE_ID?v=...
    databaseId: "TODO",

    // Legacy: For backward compatibility (will be removed once OAuth is fully working)
    // Get this from https://www.notion.so/my-integrations
    notionToken: "ntn_TODO",
};
