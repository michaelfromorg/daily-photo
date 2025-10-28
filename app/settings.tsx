import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import {
    scheduleRandomDailyNotification,
    getScheduledNotificationTime,
} from "../lib/notifications";
import {
    useNotionAuth,
    exchangeCodeForToken,
    saveAccessToken,
    clearAccessToken,
    getAccessToken,
    getWorkspaceInfo,
} from "../lib/auth";
import { ResponseType } from "expo-auth-session";

export default function SettingsScreen() {
    const [scheduledTime, setScheduledTime] = useState<{
        hour: number;
        minute: number;
    } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [workspaceInfo, setWorkspaceInfo] = useState<{ name: string; id: string } | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const { request, response, promptAsync, redirectUri } = useNotionAuth();

    useEffect(() => {
        const loadScheduledTime = async () => {
            const time = await getScheduledNotificationTime();
            setScheduledTime(time);
        };

        const checkAuth = async () => {
            const token = await getAccessToken();
            setIsAuthenticated(!!token);

            if (token) {
                const workspace = await getWorkspaceInfo();
                setWorkspaceInfo(workspace);
            }
        };

        loadScheduledTime();
        checkAuth();
    }, []);

    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            handleAuthCode(code);
        } else if (response?.type === "error") {
            setIsAuthenticating(false);
            Alert.alert("Authentication Error", "Failed to sign in with Notion");
        }
    }, [response]);

    const handleAuthCode = async (code: string) => {
        setIsAuthenticating(true);
        try {
            const tokenData = await exchangeCodeForToken(code, redirectUri);
            await saveAccessToken(tokenData);
            setIsAuthenticated(true);
            setWorkspaceInfo({
                name: tokenData.workspace_name || "Notion Workspace",
                id: tokenData.workspace_id,
            });
            Alert.alert("Success!", "Signed in to Notion successfully");
        } catch (error) {
            console.error("Auth error:", error);
            Alert.alert("Error", "Failed to complete authentication");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleSignIn = async () => {
        setIsAuthenticating(true);
        try {
            await promptAsync();
        } catch (error) {
            setIsAuthenticating(false);
            Alert.alert("Error", "Failed to initiate sign in");
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out of Notion?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        await clearAccessToken();
                        setIsAuthenticated(false);
                        setWorkspaceInfo(null);
                        Alert.alert("Signed Out", "You've been signed out of Notion");
                    },
                },
            ]
        );
    };

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
            <Text style={styles.sectionTitle}>Notion Account</Text>

            {isAuthenticated ? (
                <View style={styles.section}>
                    <Text style={styles.info}>
                        Signed in as: {workspaceInfo?.name || "Notion User"}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, styles.dangerButton]}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.section}>
                    <Text style={styles.description}>
                        Sign in with Notion to sync your daily photos
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSignIn}
                        disabled={isAuthenticating || !request}
                    >
                        {isAuthenticating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign in with Notion</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.divider} />

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
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
    },
    info: {
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
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
        textAlign: "center",
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E5E5",
        marginVertical: 30,
    },
});
