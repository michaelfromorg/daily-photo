import { Inter_900Black, useFonts } from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { requestPermissions } from "../lib/notifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		Inter_900Black,
	});

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}

		// Request notification permissions on app start
		requestPermissions();
	}, [loaded, error]);

	if (!loaded && !error) {
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
			{/*<Stack.Screen name="history" options={{ title: "Photo History" }} />*/}
		</Stack>
	);
}
