import { Inter_900Black, useFonts } from "@expo-google-fonts/inter";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { requestPermissions } from "../lib/notifications";
import { useNotionAuth } from "../lib/notionAuth";
import { getDatabaseId } from "../lib/storage";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		Inter_900Black,
	});
	const [hasDatabaseId, setHasDatabaseId] = useState<boolean | null>(null);

	const { isAuthenticated, isLoading } = useNotionAuth();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}

		// Request notification permissions on app start
		requestPermissions();
	}, [loaded, error]);

	// Check for database ID
	useEffect(() => {
		const checkDatabaseId = async () => {
			if (isAuthenticated) {
				const dbId = await getDatabaseId();
				setHasDatabaseId(!!dbId);
			} else {
				setHasDatabaseId(null);
			}
		};

		checkDatabaseId();
	}, [isAuthenticated]);

	// Handle authentication and database selection redirects
	useEffect(() => {
		if (isLoading || !loaded || hasDatabaseId === null) return;

		const inAuthGroup = segments[0] === "login" || segments[0] === "oauth";
		const inDatabaseSelection = segments[0] === "database-selection";

		if (!isAuthenticated && !inAuthGroup) {
			// Redirect to login if not authenticated
			router.replace("/login");
		} else if (
			isAuthenticated &&
			!hasDatabaseId &&
			!inDatabaseSelection &&
			!inAuthGroup
		) {
			// Redirect to database selection if authenticated but no database selected
			router.replace("/database-selection");
		} else if (isAuthenticated && hasDatabaseId && inAuthGroup) {
			// Redirect to main app if authenticated and has database
			router.replace("/");
		}
	}, [
		isAuthenticated,
		isLoading,
		loaded,
		hasDatabaseId,
		segments,
		router.replace,
	]);

	if (!loaded && !error) {
		return null;
	}

	// Show nothing while auth is loading to prevent flashing
	if (isLoading) {
		return null;
	}

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: "#000",
				},
				headerTintColor: "#fff",
				headerTitleStyle: {
					fontWeight: "bold",
					fontFamily: "Inter_900Black",
				},
			}}
		>
			<Stack.Screen name="index" options={{ title: "Daily Photo" }} />
			<Stack.Screen name="settings" options={{ title: "Settings" }} />
			<Stack.Screen
				name="database-selection"
				options={{ title: "Select Database" }}
			/>
			<Stack.Screen
				name="login"
				options={{
					headerShown: false,
					animation: "fade",
				}}
			/>
			<Stack.Screen
				name="oauth/callback"
				options={{
					headerShown: false,
					animation: "fade",
				}}
			/>
			{/*<Stack.Screen name="history" options={{ title: "Photo History" }} />*/}
		</Stack>
	);
}
