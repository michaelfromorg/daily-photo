import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { code, state, error } = req.query;

	if (error) {
		console.error("OAuth error:", error);
		return res.status(400).send(`
      <html>
        <head><title>Authentication Failed</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>❌ Authentication Failed</h1>
          <p>Error: ${error}</p>
          <p><a href="/">Return to app</a></p>
        </body>
      </html>
    `);
	}

	if (!code || typeof code !== "string") {
		return res
			.status(400)
			.json({ error: "Missing or invalid authorization code" });
	}

	const clientId = process.env.NOTION_CLIENT_ID;
	const clientSecret = process.env.NOTION_CLIENT_SECRET;
	const redirectUri = process.env.NOTION_REDIRECT_URI;

	if (!clientId || !clientSecret || !redirectUri) {
		return res.status(500).json({ error: "Missing environment variables" });
	}

	try {
		const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
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

		const params = new URLSearchParams({
			access_token: tokens.access_token,
			...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
			...(tokens.bot_id && { bot_id: tokens.bot_id }),
			...(tokens.workspace_id && { workspace_id: tokens.workspace_id }),
			...(tokens.workspace_name && { workspace_name: tokens.workspace_name }),
			...(tokens.workspace_icon && { workspace_icon: tokens.workspace_icon }),
			...(state && { state: state as string }),
		});

		// Detect mobile vs web based on user agent or state param
		const userAgent = req.headers["user-agent"]?.toLowerCase() ?? "";
		const isMobile =
			userAgent.includes("iphone") || userAgent.includes("android");

		// Build the appropriate redirect URL
		const mobileDeepLink = `dailynotion://oauth/callback?${params.toString()}`;
		const webRedirect = `https://ltcodoq-michaelfromyeg-8081.exp.direct/oauth/callback?${params.toString()}`;

		const redirectUrl = isMobile ? mobileDeepLink : webRedirect;

		// Respond with redirect page
		return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Authentication Successful</title>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <style>
            body {
              font-family: system-ui;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #1a1a1a;
              color: white;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-top: 20px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <h1>✅ Connected to Notion!</h1>
          <div class="spinner"></div>
          <p>Redirecting you...</p>
          <script>
            setTimeout(() => { window.location.href = "${redirectUrl}"; }, 1000);
          </script>
        </body>
      </html>
    `);
	} catch (err) {
		console.error("Error during token exchange:", err);
		return res.status(500).send("Error during OAuth flow");
	}
}
