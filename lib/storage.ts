import * as SecureStore from "expo-secure-store";

export async function saveNotificationId(id: string) {
    await SecureStore.setItemAsync("notification_id", id);
}

export async function getNotificationId() {
    return await SecureStore.getItemAsync("notification_id");
}

export async function saveLastPhotoTime(timestamp: number) {
    await SecureStore.setItemAsync("last_photo", timestamp.toString());
}

export async function getLastPhotoTime(): Promise<number | null> {
    const time = await SecureStore.getItemAsync("last_photo");
    return time ? parseInt(time, 10) : null;
}
