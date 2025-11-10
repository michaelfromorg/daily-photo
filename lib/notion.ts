// lib/notion.ts
import { Client } from "@notionhq/client";
import * as FileSystem from "expo-file-system/legacy";
import { config } from "../constants/config";
import { getAccessToken } from "./storage";

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

	return new Client({ auth: token });
}

export async function uploadPhotoToNotion(photoUri: string, caption: string) {
	try {
		const notion = await getNotionClient();
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
					"Notion-Version": "2022-06-28",
				},
			},
		);

		console.log("✓ Upload response status:", uploadResponse.status);

		if (uploadResponse.status !== 200) {
			throw new Error(`Upload failed: ${uploadResponse.body}`);
		}

		console.log("Step 3: Creating page in database...");
		const page = await notion.pages.create({
			parent: {
				database_id: config.databaseId,
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
