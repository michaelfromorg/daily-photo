import { Client } from "@notionhq/client";
import * as FileSystem from "expo-file-system/legacy";
import { config } from "../constants/config";
import { getAccessToken, getDatabaseId } from "./storage";

import "cross-fetch/polyfill";
import { Platform } from "react-native";

/**
 * Get an authenticated Notion client using OAuth token from secure storage
 */
async function getNotionClient(): Promise<Client> {
	const token = await getAccessToken();

	if (!token) {
		throw new Error(
			"No Notion access token found. Please log in to connect your Notion workspace.",
		);
	}

	return new Client({
		auth: token,
		notionVersion: "2025-09-03",
		fetch: Platform.OS === "web" ? window.fetch.bind(window) : undefined,
	});
}

/**
 * Search for all accessible databases in the user's Notion workspace
 * In API 2025-09-03, this searches for data sources (which are the tables/databases)
 */
export async function searchDatabases() {
	try {
		const notion = await getNotionClient();

		const response = await notion.search({
			filter: {
				property: "object",
				value: "data_source",
			},
			sort: {
				direction: "descending",
				timestamp: "last_edited_time",
			},
		});

		return response.results
			.filter((result: any) => result.object === "data_source")
			.map((dataSource: any) => {
				const title = dataSource.title?.[0]?.plain_text || "Untitled Database";
				return {
					id: dataSource.id,
					title,
					properties: Object.keys(dataSource.properties || {}),
					url: dataSource.url,
					lastEditedTime: dataSource.last_edited_time,
				};
			});
	} catch (error) {
		console.error("❌ Error searching databases:", error);
		throw error;
	}
}

export async function uploadPhotoToNotion(photoUri: string, caption: string) {
	try {
		const notion = await getNotionClient();
		// Note: In API 2025-09-03, this is actually a data source ID
		// but we keep the variable name for backwards compatibility
		const databaseId = await getDatabaseId();

		if (!databaseId) {
			throw new Error(
				"No database selected. Please select a database in settings.",
			);
		}

		const fileName = `photo-${Date.now()}.jpg`;

		console.log("Step 1: Creating file upload in Notion...");
		const fileUploadResponse: any = await notion.request({
			path: "file_uploads",
			method: "post",
			body: {
				name: fileName,
				mime_type: "image/jpeg",
			},
		});

		console.log("✓ File upload created:", fileUploadResponse.id);

		console.log("Step 2: Uploading to Notion using FileSystem...");
		const token = await getAccessToken();
		if (!token) {
			throw new Error("No access token available for file upload");
		}

		const uploadResponse = await FileSystem.uploadAsync(
			fileUploadResponse.upload_url,
			photoUri,
			{
				fieldName: "file",
				httpMethod: "POST",
				uploadType: FileSystem.FileSystemUploadType.MULTIPART,
				headers: {
					Authorization: `Bearer ${token}`,
					"Notion-Version": "2025-09-03",
				},
			},
		);

		console.log("✓ Upload response status:", uploadResponse.status);

		if (uploadResponse.status !== 200) {
			throw new Error(`Upload failed: ${uploadResponse.body}`);
		}

		console.log("Step 3: Creating page in data source...");
		const page = await notion.pages.create({
			parent: {
				type: "data_source_id",
				data_source_id: databaseId,
			},
			properties: {
				Caption: {
					title: [
						{
							text: {
								content:
									caption || `Photo - ${new Date().toLocaleDateString()}`,
							},
						},
					],
				},
				Photo: {
					files: [
						{
							name: fileName,
							type: "file_upload",
							file_upload: {
								id: fileUploadResponse.id,
							},
						},
					],
				},
			},
		});

		console.log("✅ Success! Page created:", (page as any).url);
		return page;
	} catch (error) {
		console.error("❌ Error uploading to Notion:", error);
		throw error;
	}
}
