// lib/notion.ts
import { Client } from "@notionhq/client";
import * as FileSystem from "expo-file-system/legacy";
import { config } from "../constants/config";
import { getAccessToken } from "./auth";

// Create a function to get the Notion client with the current token
async function getNotionClient(): Promise<Client> {
    const oauthToken = await getAccessToken();
    const token = oauthToken || config.notionToken;

    if (!token || token === "ntn_TODO") {
        throw new Error("No Notion token available. Please sign in with Notion.");
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
        const oauthToken = await getAccessToken();
        const token = oauthToken || config.notionToken;

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
                                    caption ||
                                    `Photo - ${new Date().toLocaleDateString()}`,
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
