import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * OAuth callback handler for Notion integration.
 *
 * This serverless function:
 * 1. Receives authorization code from Notion
 * 2. Exchanges it for access/refresh tokens (keeping client_secret secure)
 * 3. Redirects back to mobile app with tokens via custom URL scheme
 *
 * Environment variables required:
 * - NOTION_CLIENT_ID: Your Notion integration client ID
 * - NOTION_CLIENT_SECRET: Your Notion integration client secret (keep secure!)
 * - NOTION_REDIRECT_URI: This endpoint's URL (https://your-app.vercel.app/api/notion-callback)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { code, state, error } = req.query;

	// Handle OAuth errors
	if (error) {
		console.error("OAuth error:", error);
		return res.status(400).send(`
      <html>
        <head><title>Authentication Failed</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>❌ Authentication Failed</h1>
          <p>Error: ${error}</p>
          <p><a href="dailynotion://">Return to app</a></p>
        </body>
      </html>
    `);
	}

	// Validate authorization code
	if (!code || typeof code !== "string") {
		return res.status(400).json({
			error: "Missing or invalid authorization code",
		});
	}

	// Validate environment variables
	const clientId = process.env.NOTION_CLIENT_ID;
	const clientSecret = process.env.NOTION_CLIENT_SECRET;
	const redirectUri = process.env.NOTION_REDIRECT_URI;

	if (!clientId || !clientSecret || !redirectUri) {
		console.error("Missing required environment variables");
		return res.status(500).json({
			error: "Server configuration error",
		});
	}

	try {
		console.log("Exchanging authorization code for tokens...");

		// Exchange authorization code for tokens
		const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${clientId}:${clientSecret}`,
				).toString("base64")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				grant_type: "authorization_code",
				code,
				redirect_uri: redirectUri,
			}),
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.text();
			console.error("Token exchange failed:", errorData);
			throw new Error(`Token exchange failed: ${tokenResponse.status}`);
		}

		const tokens = await tokenResponse.json();
		console.log("Token exchange successful, redirecting to app...");

		// Build deep link with tokens
		// Using URL encoding to safely pass tokens
		const params = new URLSearchParams({
			access_token: tokens.access_token,
			...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
			...(tokens.bot_id && { bot_id: tokens.bot_id }),
			...(tokens.workspace_id && { workspace_id: tokens.workspace_id }),
			...(tokens.workspace_name && { workspace_name: tokens.workspace_name }),
			...(tokens.workspace_icon && { workspace_icon: tokens.workspace_icon }),
			...(state && { state: state as string }),
		});

		const deepLink = `dailynotion://oauth/callback?${params.toString()}`;

		// Return HTML page that redirects to the app
		return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Authentication Successful</title>
          <meta http-equiv="refresh" content="1;url=${deepLink}">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: rgba(255,255,255,0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 { margin: 0 0 20px 0; font-size: 48px; }
            p { margin: 10px 0; font-size: 18px; opacity: 0.9; }
            a {
              color: white;
              text-decoration: underline;
              font-weight: 500;
            }
            .spinner {
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Success!</h1>
            <p>Notion connected successfully</p>
            <div class="spinner"></div>
            <p>Redirecting to Daily Photo...</p>
            <p style="margin-top: 30px; font-size: 14px;">
              If you're not redirected automatically,<br>
              <a href="${deepLink}">click here to open the app</a>
            </p>
          </div>
        </body>
      </html>
    `);
	} catch (error) {
		console.error("Error during token exchange:", error);
		return res.status(500).send(`
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>❌ Authentication Error</h1>
          <p>Failed to exchange authorization code for tokens.</p>
          <p style="color: #666; font-size: 14px;">
            ${error instanceof Error ? error.message : "Unknown error"}
          </p>
          <p><a href="dailynotion://">Return to app</a></p>
        </body>
      </html>
    `);
	}
}
