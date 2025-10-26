import { Stack } from "expo-router";
import { useEffect } from "react";
import { requestPermissions } from "../lib/notifications";

export default function RootLayout() {
    useEffect(() => {
        // Request notification permissions on app start
        requestPermissions();
    }, []);

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Daily Photo" }} />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            {/*<Stack.Screen name="history" options={{ title: "Photo History" }} />*/}
        </Stack>
    );
}
