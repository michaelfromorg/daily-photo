import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { config } from "../constants/config";
import {
	clearOAuthData,
	getAccessToken,
	getWorkspaceInfo,
	saveAccessToken,
	saveRefreshToken,
	saveWorkspaceInfo,
} from "./storage";

// CRITICAL: This must be called at the top level of the app
// It ensures the browser session is properly closed after OAuth
WebBrowser.maybeCompleteAuthSession();

interface NotionAuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	workspaceName: string | null;
}

interface NotionOAuthTokens {
	access_token: string;
	refresh_token?: string;
	bot_id?: string;
	workspace_id?: string;
	workspace_name?: string;
}

export function useNotionAuth() {
	const [state, setState] = useState<NotionAuthState>({
		isAuthenticated: false,
		isLoading: true,
		workspaceName: null,
	});

	const checkAuthStatus = useCallback(async () => {
		try {
			const token = await getAccessToken();
			const { workspaceName } = await getWorkspaceInfo();

			setState({
				isAuthenticated: !!token,
				isLoading: false,
				workspaceName: workspaceName || null,
			});
		} catch (error) {
			console.error("Error checking auth status:", error);
			setState({
				isAuthenticated: false,
				isLoading: false,
				workspaceName: null,
			});
		}
	}, []);

	// Check authentication status on mount
	useEffect(() => {
		checkAuthStatus();
	}, [checkAuthStatus]);

	// Listen for deep link events (OAuth callback from backend)
	useEffect(() => {
		async function handleOAuthCallback(tokens: NotionOAuthTokens) {
			try {
				console.log("🔐 Processing OAuth tokens...");

				const {
					access_token,
					refresh_token,
					bot_id,
					workspace_id,
					workspace_name,
				} = tokens;

				if (!access_token) {
					throw new Error("No access token received");
				}

				// Store tokens securely
				await saveAccessToken(access_token);

				if (refresh_token) {
					await saveRefreshToken(refresh_token);
				}

				if (bot_id && workspace_id) {
					await saveWorkspaceInfo(bot_id, workspace_id, workspace_name);
				}

				console.log("✅ OAuth tokens stored successfully");

				// Update state
				setState({
					isAuthenticated: true,
					isLoading: false,
					workspaceName: workspace_name || null,
				});
			} catch (error) {
				console.error("❌ Error handling OAuth callback:", error);
				setState((prev) => ({
					...prev,
					isLoading: false,
				}));
			}
		}

		function handleDeepLink({ url }: { url: string }) {
			console.log("📱 Deep link received:", url);

			// Parse the URL to extract OAuth tokens
			const parsedUrl = Linking.parse(url);

			if (parsedUrl.path === "oauth/callback" && parsedUrl.queryParams) {
				handleOAuthCallback(
					parsedUrl.queryParams as unknown as NotionOAuthTokens,
				);
			}
		}

		const subscription = Linking.addEventListener("url", handleDeepLink);
		return () => subscription.remove();
	}, []);

	const login = useCallback(async () => {
		try {
			if (!config.notionOAuthClientId) {
				throw new Error(
					"Notion OAuth client ID not configured. Please set EXPO_PUBLIC_NOTION_CLIENT_ID environment variable.",
				);
			}

			if (!config.backendUrl) {
				throw new Error(
					"Backend URL not configured. Please set EXPO_PUBLIC_BACKEND_URL environment variable.",
				);
			}

			setState((prev) => ({ ...prev, isLoading: true }));

			// Generate state parameter for CSRF protection
			const state = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				`${Date.now()}-${Math.random()}`,
			);

			// Build Notion OAuth URL
			// This will redirect to our backend, which will handle the token exchange
			const redirectUri = `${config.backendUrl}/api/notion-callback`;

			const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
			authUrl.searchParams.set("client_id", config.notionOAuthClientId);
			authUrl.searchParams.set("redirect_uri", redirectUri);
			authUrl.searchParams.set("response_type", "code");
			authUrl.searchParams.set("owner", "user");
			authUrl.searchParams.set("state", state);

			console.log("🌐 Opening Notion OAuth...");
			console.log("Redirect URI:", redirectUri);

			// Open browser for OAuth flow
			const result = await WebBrowser.openAuthSessionAsync(
				authUrl.toString(),
				"dailynotion://", // The backend will redirect to this scheme
			);

			console.log("OAuth browser result:", result.type);

			if (result.type === "cancel" || result.type === "dismiss") {
				console.log("User cancelled OAuth flow");
				setState((prev) => ({ ...prev, isLoading: false }));
			}
			// If successful, the deep link handler will process the tokens
		} catch (error) {
			console.error("❌ Error during login:", error);
			setState((prev) => ({ ...prev, isLoading: false }));
			throw error;
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await clearOAuthData();
			setState({
				isAuthenticated: false,
				isLoading: false,
				workspaceName: null,
			});
			console.log("✅ Logged out successfully");
		} catch (error) {
			console.error("Error during logout:", error);
			throw error;
		}
	}, []);

	return {
		isAuthenticated: state.isAuthenticated,
		isLoading: state.isLoading,
		workspaceName: state.workspaceName,
		login,
		logout,
		checkAuthStatus,
	};
}
