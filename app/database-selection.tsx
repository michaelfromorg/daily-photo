import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { searchDatabases } from "../lib/notion";
import { saveDatabaseId } from "../lib/storage";

interface Database {
	id: string;
	title: string;
	properties: string[];
	url: string;
	lastEditedTime: string;
}

export default function DatabaseSelectionScreen() {
	const [databases, setDatabases] = useState<Database[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		loadDatabases();
	}, []);

	const loadDatabases = async () => {
		try {
			setIsLoading(true);
			const results = await searchDatabases();
			setDatabases(results);
		} catch (error) {
			console.error("Error loading databases:", error);
			Alert.alert(
				"Error",
				"Failed to load databases. Please check your Notion connection and try again.",
				[
					{
						text: "Retry",
						onPress: loadDatabases,
					},
					{
						text: "Cancel",
						style: "cancel",
						onPress: () => router.back(),
					},
				],
			);
		} finally {
			setIsLoading(false);
		}
	};

	const validateDatabase = (database: Database): boolean => {
		const hasCaption = database.properties.includes("Caption");
		const hasPhoto = database.properties.includes("Photo");

		if (!hasCaption || !hasPhoto) {
			Alert.alert(
				"Invalid Database",
				`This database is missing required properties:\n${!hasCaption ? "• Caption (title property)\n" : ""}${!hasPhoto ? "• Photo (files property)" : ""}\n\nPlease select a database with both Caption and Photo properties, or duplicate the template database.`,
			);
			return false;
		}

		return true;
	};

	const handleSelectDatabase = async (database: Database) => {
		if (!validateDatabase(database)) {
			return;
		}

		setSelectedId(database.id);

		try {
			await saveDatabaseId(database.id);
			Alert.alert(
				"Database Selected",
				`Successfully connected to "${database.title}". You can now start taking photos!`,
				[
					{
						text: "OK",
						onPress: () => router.replace("/"),
					},
				],
			);
		} catch (error) {
			console.error("Error saving database ID:", error);
			Alert.alert("Error", "Failed to save database selection. Please try again.");
			setSelectedId(null);
		}
	};

	const renderDatabase = ({ item }: { item: Database }) => {
		const hasRequiredProps =
			item.properties.includes("Caption") && item.properties.includes("Photo");

		return (
			<TouchableOpacity
				style={[
					styles.databaseCard,
					!hasRequiredProps && styles.databaseCardDisabled,
					selectedId === item.id && styles.databaseCardSelected,
				]}
				onPress={() => handleSelectDatabase(item)}
				disabled={selectedId !== null}
			>
				<View style={styles.databaseHeader}>
					<Text style={styles.databaseTitle} numberOfLines={1}>
						{item.title}
					</Text>
					{hasRequiredProps ? (
						<Text style={styles.validBadge}>✓ Valid</Text>
					) : (
						<Text style={styles.invalidBadge}>⚠ Missing props</Text>
					)}
				</View>
				<Text style={styles.databaseProperties}>
					Properties: {item.properties.join(", ")}
				</Text>
				{!hasRequiredProps && (
					<Text style={styles.warningText}>
						Missing required properties: Caption and/or Photo
					</Text>
				)}
			</TouchableOpacity>
		);
	};

	if (isLoading) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Loading your databases...</Text>
			</View>
		);
	}

	if (databases.length === 0) {
		return (
			<View style={styles.centerContainer}>
				<Text style={styles.emoji}>🗂️</Text>
				<Text style={styles.emptyTitle}>No Databases Found</Text>
				<Text style={styles.emptyText}>
					We couldn't find any databases in your Notion workspace.
				</Text>
				<Text style={styles.emptyText}>
					Please create a database with "Caption" (title) and "Photo" (files)
					properties, then try again.
				</Text>
				<TouchableOpacity style={styles.button} onPress={loadDatabases}>
					<Text style={styles.buttonText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Select Your Database</Text>
				<Text style={styles.subtitle}>
					Choose the database where your daily photos will be saved. Make sure
					it has "Caption" and "Photo" properties.
				</Text>
			</View>

			<FlatList
				data={databases}
				renderItem={renderDatabase}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				refreshing={isLoading}
				onRefresh={loadDatabases}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 30,
		backgroundColor: "#fff",
	},
	header: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#000",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		lineHeight: 22,
	},
	listContent: {
		padding: 15,
	},
	databaseCard: {
		backgroundColor: "#f8f8f8",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 2,
		borderColor: "#e0e0e0",
	},
	databaseCardDisabled: {
		opacity: 0.6,
	},
	databaseCardSelected: {
		borderColor: "#007AFF",
		backgroundColor: "#e8f4ff",
	},
	databaseHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	databaseTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000",
		flex: 1,
		marginRight: 10,
	},
	databaseProperties: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	validBadge: {
		fontSize: 12,
		color: "#34C759",
		fontWeight: "600",
		backgroundColor: "#E8F8EA",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	invalidBadge: {
		fontSize: 12,
		color: "#FF9500",
		fontWeight: "600",
		backgroundColor: "#FFF3E0",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	warningText: {
		fontSize: 12,
		color: "#FF3B30",
		marginTop: 4,
		fontStyle: "italic",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#666",
	},
	emoji: {
		fontSize: 64,
		marginBottom: 20,
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 12,
		color: "#000",
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 12,
		lineHeight: 22,
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 8,
		marginTop: 20,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
