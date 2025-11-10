import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Keys
const KEYS = {
	NOTIFICATION_ID: "notification_id",
	LAST_PHOTO: "last_photo",
	ACCESS_TOKEN: "notion_access_token",
	REFRESH_TOKEN: "notion_refresh_token",
	BOT_ID: "notion_bot_id",
	WORKSPACE_ID: "notion_workspace_id",
	WORKSPACE_NAME: "notion_workspace_name",
} as const;

// Determine if running on web
const isWeb = Platform.OS === "web";

// Wrapper functions to abstract storage logic
async function setItem(key: string, value: string) {
	if (isWeb) {
		localStorage.setItem(key, value);
	} else {
		await SecureStore.setItemAsync(key, value);
	}
}

async function getItem(key: string): Promise<string | null> {
	if (isWeb) {
		return localStorage.getItem(key);
	}
	return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
	if (isWeb) {
		localStorage.removeItem(key);
	} else {
		await SecureStore.deleteItemAsync(key);
	}
}

// Notification storage
export async function saveNotificationId(id: string) {
	await setItem(KEYS.NOTIFICATION_ID, id);
}

export async function getNotificationId() {
	return await getItem(KEYS.NOTIFICATION_ID);
}

// Photo history storage
export async function saveLastPhotoTime(timestamp: number) {
	await setItem(KEYS.LAST_PHOTO, timestamp.toString());
}

export async function getLastPhotoTime(): Promise<number | null> {
	const time = await getItem(KEYS.LAST_PHOTO);
	return time ? parseInt(time, 10) : null;
}

// OAuth token storage
export async function saveAccessToken(token: string) {
	await setItem(KEYS.ACCESS_TOKEN, token);
}

export async function getAccessToken(): Promise<string | null> {
	return await getItem(KEYS.ACCESS_TOKEN);
}

export async function saveRefreshToken(token: string) {
	await setItem(KEYS.REFRESH_TOKEN, token);
}

export async function getRefreshToken(): Promise<string | null> {
	return await getItem(KEYS.REFRESH_TOKEN);
}

// Workspace info storage
export async function saveWorkspaceInfo(
	botId: string,
	workspaceId: string,
	workspaceName?: string,
) {
	await setItem(KEYS.BOT_ID, botId);
	await setItem(KEYS.WORKSPACE_ID, workspaceId);
	if (workspaceName) {
		await setItem(KEYS.WORKSPACE_NAME, workspaceName);
	}
}

export async function getWorkspaceInfo() {
	const [botId, workspaceId, workspaceName] = await Promise.all([
		getItem(KEYS.BOT_ID),
		getItem(KEYS.WORKSPACE_ID),
		getItem(KEYS.WORKSPACE_NAME),
	]);
	return {
		botId,
		workspaceId,
		workspaceName,
	};
}

// Clear all OAuth-related data
export async function clearOAuthData() {
	await Promise.all([
		deleteItem(KEYS.ACCESS_TOKEN),
		deleteItem(KEYS.REFRESH_TOKEN),
		deleteItem(KEYS.BOT_ID),
		deleteItem(KEYS.WORKSPACE_ID),
		deleteItem(KEYS.WORKSPACE_NAME),
	]);
}
