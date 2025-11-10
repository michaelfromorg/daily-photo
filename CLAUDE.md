# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daily Photo is a personal photo-a-day app built with Expo React Native. It's a mini BeReal replacement without social features - users take a daily photo with their camera and upload it directly to a Notion database with a caption. The app includes daily notification reminders at random times.

## Development Commands

### Essential Commands
```bash
# Start development server with tunnel (required for some features)
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Test Notion upload functionality
npm run test-upload
```

The app uses Expo with dev-client enabled, so you need to run with `--dev-client` flag for full functionality.

## Architecture Overview

### Tech Stack
- **Expo Router** for file-based navigation (app/ directory)
- **Expo Camera** for camera functionality
- **@notionhq/client** for Notion API integration
- **Expo Notifications** for daily reminders
- **Expo Secure Store** for persistent storage
- Custom Inter_900Black font for headers

### File Structure
```
app/                    # Expo Router screens
├── _layout.tsx        # Root layout with Stack navigation
├── index.tsx          # Camera screen (home)
├── settings.tsx       # Notification settings
└── components/        # Reusable UI components

lib/                   # Core business logic
├── notion.ts          # Notion API integration (file uploads & page creation)
├── notifications.ts   # Daily notification scheduling
└── storage.ts         # Secure storage helpers

constants/
└── config.ts          # Notion credentials (token & database ID)

scripts/
└── uploadToNotion.ts  # CLI tool for testing Notion uploads
```

### Key Architectural Patterns

**Notion Integration Flow**
The Notion upload process is a 3-step operation (lib/notion.ts:8-82):
1. Create a file upload placeholder via Notion API
2. Upload the actual image file using expo-file-system's uploadAsync with multipart form data
3. Create a database page linking to the uploaded file

The database expects two properties:
- `Caption` (title): The photo caption or auto-generated date
- `Photo` (files): Reference to the file upload ID

**Storage Architecture**
Uses expo-secure-store for all persistent data (lib/storage.ts):
- Notification IDs (for managing scheduled notifications)
- Last photo timestamp (for tracking upload history)

**Notification System**
Implements daily notifications at random times between 9 AM - 9 PM (lib/notifications.ts:20-47). Each time a notification is rescheduled, the previous one is cancelled and a new ID is saved. The app requests permissions on startup (app/_layout.tsx:20).

**Important:** The notification is automatically rescheduled to a new random time every time the user takes a photo (app/index.tsx:74). This ensures each day has a different reminder time, keeping the experience unpredictable like BeReal. The new time is shown in the success alert after upload.

### Configuration

**Notion Setup** (constants/config.ts)
- Hardcoded credentials are currently in source (should be moved to environment variables)
- `notionToken`: Integration token from https://www.notion.so/my-integrations
- `databaseId`: Extracted from the database URL

**Expo Config** (app.json)
- Package name: `com.michaelfromyeg.dailynotion`
- Plugins enabled: expo-router, expo-secure-store, expo-notifications, expo-font
- New Architecture enabled
- Typed routes enabled

## Common Development Patterns

### Camera Flow
The camera screen has three states:
1. Permission request state
2. Active camera view with flip and capture controls
3. Preview state with caption input and upload/retake buttons

Front camera photos are flipped horizontally to match user expectations (app/index.tsx:54-59).

### Testing Notion Uploads
Use `npm run test-upload` to test Notion integration without running the mobile app. The script expects an image at `images/bereal.png`.

## Linting and Code Quality

The project uses Biome for linting (`@biomejs/biome`). Configuration is managed through Biome's standard setup.

## Node Version

The project specifies Node.js version in `.nvmrc`.
