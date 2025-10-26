// scripts/uploadToNotion.ts
import { uploadPhotoToNotion } from "../lib/notion";
import * as path from "path";
import * as fs from "fs";

async function main() {
    try {
        // Get the image path
        const imagePath = path.join(__dirname, "../images/bereal.png");

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            console.error(`Image not found at: ${imagePath}`);
            process.exit(1);
        }

        console.log(`Uploading image from: ${imagePath}`);

        // For Node.js, we need to pass a file:// URI or adapt the function
        const fileUri = `file://${imagePath}`;

        console.log("Starting upload to Notion...");
        const result = await uploadPhotoToNotion(fileUri);

        console.log("✅ Upload successful!");
        console.log("Page created:", result);
    } catch (error) {
        console.error("❌ Upload failed:", error);
        process.exit(1);
    }
}

main();
