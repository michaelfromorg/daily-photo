// lib/auth.ts
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { config } from "../constants/config";

WebBrowser.maybeCompleteAuthSession();

const NOTION_AUTH_URL = "https://api.notion.com/v1/oauth/authorize";
const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";
const TOKEN_KEY = "notion_access_token";

export type NotionTokenData = {
    access_token: string;
    workspace_id: string;
    workspace_name?: string;
    workspace_icon?: string;
    bot_id: string;
    owner?: {
        type: string;
        user?: {
            id: string;
            name?: string;
        };
    };
};

export async function getAccessToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error("Error getting access token:", error);
        return null;
    }
}

export async function saveAccessToken(tokenData: NotionTokenData): Promise<void> {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, tokenData.access_token);
        // Optionally store workspace info for display
        await SecureStore.setItemAsync("notion_workspace_name", tokenData.workspace_name || "");
        await SecureStore.setItemAsync("notion_workspace_id", tokenData.workspace_id);
    } catch (error) {
        console.error("Error saving access token:", error);
        throw error;
    }
}

export async function clearAccessToken(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync("notion_workspace_name");
        await SecureStore.deleteItemAsync("notion_workspace_id");
    } catch (error) {
        console.error("Error clearing access token:", error);
    }
}

export async function getWorkspaceInfo(): Promise<{ name: string; id: string } | null> {
    try {
        const name = await SecureStore.getItemAsync("notion_workspace_name");
        const id = await SecureStore.getItemAsync("notion_workspace_id");

        if (name && id) {
            return { name, id };
        }
        return null;
    } catch (error) {
        console.error("Error getting workspace info:", error);
        return null;
    }
}

export function useNotionAuth() {
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: config.appScheme,
    });

    const discovery = {
        authorizationEndpoint: NOTION_AUTH_URL,
        tokenEndpoint: NOTION_TOKEN_URL,
    };

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: config.notionClientId,
            redirectUri,
            scopes: [], // Notion doesn't use traditional scopes
            responseType: AuthSession.ResponseType.Code,
            usePKCE: false,
        },
        discovery
    );

    return {
        request,
        response,
        promptAsync,
        redirectUri,
    };
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<NotionTokenData> {
    const credentials = btoa(`${config.notionClientId}:${config.notionClientSecret}`);

    const response = await fetch(NOTION_TOKEN_URL, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Token exchange failed:", error);
        throw new Error(`Failed to exchange code for token: ${response.status}`);
    }

    const data = await response.json();
    return data;
}
