import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useNotionAuth } from "../lib/notionAuth";
import { AppText } from "../components/Text";

export default function LoginScreen() {
	const { isAuthenticated, isLoading, login } = useNotionAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated) {
			// Redirect to main app if already authenticated
			router.replace("/");
		}
	}, [isAuthenticated, router.replace]);

	const handleLogin = async () => {
		try {
			await login();
		} catch (error) {
			console.error("Login error:", error);
			Alert.alert(
				"Login Failed",
				error instanceof Error
					? error.message
					: "Failed to connect to Notion. Please try again.",
			);
		}
	};

	if (isLoading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Checking authentication...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.emoji}>📸</Text>
				<AppText style={styles.title}>Daily Photo</AppText>
				<Text style={styles.subtitle}>Capture your day, every day</Text>

				<View style={styles.features}>
					<View style={styles.feature}>
						<Text style={styles.featureEmoji}>📅</Text>
						<Text style={styles.featureText}>Daily photo reminders</Text>
					</View>
					<View style={styles.feature}>
						<Text style={styles.featureEmoji}>📝</Text>
						<Text style={styles.featureText}>Add captions to your photos</Text>
					</View>
					<View style={styles.feature}>
						<Text style={styles.featureEmoji}>🗂️</Text>
						<Text style={styles.featureText}>Save directly to Notion</Text>
					</View>
				</View>

				<TouchableOpacity
					style={styles.button}
					onPress={handleLogin}
					disabled={isLoading}
				>
					<AppText style={styles.buttonText}>Connect to Notion</AppText>
				</TouchableOpacity>

				<Text style={styles.hint}>
					You'll be asked to authorize this app to access your Notion workspace
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 30,
	},
	emoji: {
		fontSize: 80,
		marginBottom: 20,
	},
	title: {
		fontSize: 42,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 10,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 18,
		color: "#999",
		marginBottom: 50,
		textAlign: "center",
	},
	features: {
		width: "100%",
		marginBottom: 40,
	},
	feature: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
		paddingHorizontal: 20,
	},
	featureEmoji: {
		fontSize: 24,
		marginRight: 15,
	},
	featureText: {
		fontSize: 16,
		color: "#ccc",
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 18,
		paddingHorizontal: 40,
		borderRadius: 12,
		width: "100%",
		alignItems: "center",
		marginBottom: 20,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	hint: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		paddingHorizontal: 20,
	},
	loadingText: {
		marginTop: 20,
		fontSize: 16,
		color: "#999",
	},
});
