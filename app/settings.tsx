import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
	getScheduledNotificationTime,
	scheduleRandomDailyNotification,
} from "../lib/notifications";
import { useNotionAuth } from "../lib/notionAuth";
import { getDatabaseId } from "../lib/storage";

export default function SettingsScreen() {
	const [scheduledTime, setScheduledTime] = useState<{
		hour: number;
		minute: number;
	} | null>(null);
	const [databaseId, setDatabaseId] = useState<string | null>(null);

	const { workspaceName, logout } = useNotionAuth();
	const router = useRouter();

	useEffect(() => {
		const loadData = async () => {
			const time = await getScheduledNotificationTime();
			setScheduledTime(time);

			const dbId = await getDatabaseId();
			setDatabaseId(dbId);
		};

		loadData();
	}, []);

	const rescheduleNotification = async () => {
		const { hour, minute } = await scheduleRandomDailyNotification();
		setScheduledTime({ hour, minute });
		Alert.alert(
			"Scheduled!",
			`New notification time: ${hour}:${minute.toString().padStart(2, "0")}`,
		);
	};

	const handleChangeDatabase = () => {
		router.push("/database-selection");
	};

	const handleLogout = () => {
		Alert.alert(
			"Disconnect Notion",
			"Are you sure you want to disconnect your Notion workspace? You'll need to reconnect to upload photos.",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Disconnect",
					style: "destructive",
					onPress: async () => {
						try {
							await logout();
							router.replace("/login");
						} catch (error) {
							console.error(error);
							Alert.alert("Error", "Failed to disconnect. Please try again.");
						}
					},
				},
			],
		);
	};

	return (
		<View style={styles.container}>
			{/* Notion Connection Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Notion Connection</Text>
				{workspaceName && (
					<Text style={styles.info}>Connected to: {workspaceName}</Text>
				)}
				<TouchableOpacity
					style={[styles.button, styles.dangerButton]}
					onPress={handleLogout}
				>
					<Text style={styles.buttonText}>Disconnect Notion</Text>
				</TouchableOpacity>
			</View>

			{/* Database Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Database</Text>
				{databaseId ? (
					<Text style={styles.info}>Database ID: {databaseId}</Text>
				) : (
					<Text style={[styles.info, styles.warningText]}>
						No database selected
					</Text>
				)}
				<TouchableOpacity style={styles.button} onPress={handleChangeDatabase}>
					<Text style={styles.buttonText}>
						{databaseId ? "Change Database" : "Select Database"}
					</Text>
				</TouchableOpacity>
				<Text style={styles.description}>
					Select which Notion database your daily photos will be saved to
				</Text>
			</View>

			{/* Notifications Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Notification Settings</Text>

				{scheduledTime && (
					<Text style={styles.info}>
						Current notification time: {scheduledTime.hour}:
						{scheduledTime.minute.toString().padStart(2, "0")}
					</Text>
				)}

				<TouchableOpacity
					style={styles.button}
					onPress={rescheduleNotification}
				>
					<Text style={styles.buttonText}>
						{scheduledTime ? "Reschedule" : "Schedule"} Random Daily
						Notification
					</Text>
				</TouchableOpacity>

				<Text style={styles.description}>
					This will send you a notification at a random time between 9 AM and 9
					PM each day
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff",
	},
	section: {
		marginBottom: 40,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
		color: "#000",
	},
	info: {
		fontSize: 16,
		marginBottom: 15,
		color: "#333",
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 15,
	},
	dangerButton: {
		backgroundColor: "#FF3B30",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	description: {
		fontSize: 14,
		color: "#666",
		lineHeight: 20,
	},
	warningText: {
		color: "#FF9500",
	},
});
