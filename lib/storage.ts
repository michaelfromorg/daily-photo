import * as SecureStore from "expo-secure-store";

// Storage keys
const KEYS = {
	NOTIFICATION_ID: "notification_id",
	LAST_PHOTO: "last_photo",
	ACCESS_TOKEN: "notion_access_token",
	REFRESH_TOKEN: "notion_refresh_token",
	BOT_ID: "notion_bot_id",
	WORKSPACE_ID: "notion_workspace_id",
	WORKSPACE_NAME: "notion_workspace_name",
} as const;

// Notification storage
export async function saveNotificationId(id: string) {
	await SecureStore.setItemAsync(KEYS.NOTIFICATION_ID, id);
}

export async function getNotificationId() {
	return await SecureStore.getItemAsync(KEYS.NOTIFICATION_ID);
}

// Photo history storage
export async function saveLastPhotoTime(timestamp: number) {
	await SecureStore.setItemAsync(KEYS.LAST_PHOTO, timestamp.toString());
}

export async function getLastPhotoTime(): Promise<number | null> {
	const time = await SecureStore.getItemAsync(KEYS.LAST_PHOTO);
	return time ? parseInt(time, 10) : null;
}

// OAuth token storage
export async function saveAccessToken(token: string) {
	await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
}

export async function getAccessToken(): Promise<string | null> {
	return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function saveRefreshToken(token: string) {
	await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
}

export async function getRefreshToken(): Promise<string | null> {
	return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function saveWorkspaceInfo(
	botId: string,
	workspaceId: string,
	workspaceName?: string,
) {
	await SecureStore.setItemAsync(KEYS.BOT_ID, botId);
	await SecureStore.setItemAsync(KEYS.WORKSPACE_ID, workspaceId);
	if (workspaceName) {
		await SecureStore.setItemAsync(KEYS.WORKSPACE_NAME, workspaceName);
	}
}

export async function getWorkspaceInfo() {
	const [botId, workspaceId, workspaceName] = await Promise.all([
		SecureStore.getItemAsync(KEYS.BOT_ID),
		SecureStore.getItemAsync(KEYS.WORKSPACE_ID),
		SecureStore.getItemAsync(KEYS.WORKSPACE_NAME),
	]);
	return {
		botId,
		workspaceId,
		workspaceName,
	};
}

export async function clearOAuthData() {
	await Promise.all([
		SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
		SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
		SecureStore.deleteItemAsync(KEYS.BOT_ID),
		SecureStore.deleteItemAsync(KEYS.WORKSPACE_ID),
		SecureStore.deleteItemAsync(KEYS.WORKSPACE_NAME),
	]);
}
