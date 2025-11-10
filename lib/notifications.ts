import * as Notifications from "expo-notifications";
import { getNotificationId, saveNotificationId } from "./storage";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: false,
		shouldShowList: false,
	}),
});

export async function requestPermissions() {
	const { status } = await Notifications.requestPermissionsAsync();
	return status === "granted";
}

export async function scheduleRandomDailyNotification() {
	// Cancel previous notification if exists
	const existingId = await getNotificationId();
	if (existingId) {
		await Notifications.cancelScheduledNotificationAsync(existingId);
	}

	// Random hour between 9 AM and 9 PM
	const randomHour = Math.floor(Math.random() * 12) + 9;
	// Random minute
	const randomMinute = Math.floor(Math.random() * 60);

	const notificationId = await Notifications.scheduleNotificationAsync({
		content: {
			title: "Time to capture your day! 📸",
			body: "Take your daily photo and save it to Notion",
			sound: true,
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.DAILY,
			hour: randomHour,
			minute: randomMinute,
		},
	});

	await saveNotificationId(notificationId);
	return { hour: randomHour, minute: randomMinute };
}

export async function getScheduledNotificationTime() {
	const notificationId = await getNotificationId();
	if (!notificationId) return null;

	const notifications = await Notifications.getAllScheduledNotificationsAsync();
	const scheduled = notifications.find((n) => n.identifier === notificationId);

	if (
		scheduled?.trigger &&
		"type" in scheduled.trigger &&
		scheduled.trigger.type === "daily"
	) {
		return {
			hour: scheduled.trigger.hour,
			minute: scheduled.trigger.minute,
		};
	}
	return null;
}
