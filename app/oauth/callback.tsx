import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/**
 * OAuth callback handler screen
 *
 * This screen is displayed briefly when the OAuth flow completes.
 * The actual token processing is handled by the useNotionAuth hook
 * via deep link listeners. This screen just shows a loading state
 * and redirects to the main app.
 *
 * TODO(michaelfromyeg): make this not ugly
 */
export default function OAuthCallbackScreen() {
	const router = useRouter();

	useEffect(() => {
		// Give the deep link handler time to process the tokens
		// then redirect to the main app
		const timer = setTimeout(() => {
			router.replace("/");
		}, 1500);

		return () => clearTimeout(timer);
	}, [router.replace]);

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="#007AFF" />
			<Text style={styles.text}>Completing authentication...</Text>
			<Text style={styles.subtext}>You'll be redirected shortly</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
		padding: 20,
	},
	text: {
		marginTop: 20,
		fontSize: 18,
		color: "#fff",
		fontWeight: "600",
	},
	subtext: {
		marginTop: 10,
		fontSize: 14,
		color: "#999",
	},
});
