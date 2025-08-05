
/**
 * @file config.ts
 * @version 2.0.1
 * @author WeirdGoalieDad / Lindsay Cole
 * @dedication For Caden and Ryker.
 * @description Central configuration for the Apex Play native application.
 */

export const APP_VERSION = '2.0.1';
export const APP_AUTHOR = 'WeirdGoalieDad / Lindsay Cole';

// IMPORTANT: This is your Web Client ID from the Google Cloud Console for your OAuth 2.0 credentials.
// Even for a native app, you use the Web Client ID for the Google Sign-In flow to get the necessary tokens.
// In a real build, you would store this in a more secure way (e.g., via Gradle properties).
export const YOUTUBE_CLIENT_ID = '[YOUR_YOUTUBE_WEB_CLIENT_ID]';