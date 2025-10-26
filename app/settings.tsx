import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import {
    scheduleRandomDailyNotification,
    getScheduledNotificationTime,
} from "../lib/notifications";

export default function SettingsScreen() {
    const [scheduledTime, setScheduledTime] = useState<{
        hour: number;
        minute: number;
    } | null>(null);

    useEffect(() => {
        const loadScheduledTime = async () => {
            const time = await getScheduledNotificationTime();
            setScheduledTime(time);
        };

        loadScheduledTime();
    }, []);

    const rescheduleNotification = async () => {
        const { hour, minute } = await scheduleRandomDailyNotification();
        setScheduledTime({ hour, minute });
        Alert.alert(
            "Scheduled!",
            `New notification time: ${hour}:${minute.toString().padStart(2, "0")}`,
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notification Settings</Text>

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
                This will send you a notification at a random time between 9 AM
                and 9 PM each day
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    description: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
});
