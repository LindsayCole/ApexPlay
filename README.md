
# Apex Play: Your All-in-One Live Streaming Studio (Native Edition)

**Author:** WeirdGoalieDad / Lindsay Cole
**Dedicated To:** For Caden and Ryker.
**Version:** 2.0.0

## Marketing Brief

Apex Play transforms your Android device into a powerful, professional live streaming studio. Rebuilt from the ground up as a native application, Apex Play provides a comprehensive suite of tools to produce high-quality, engaging live streams with unparalleled performance and stability, all without the need for expensive equipment or intermediary servers.

### Key Features:

*   **Direct-to-Platform Streaming:** By leveraging native device capabilities, Apex Play streams **directly to RTMP/RTMPS endpoints** like YouTube and Twitch. This eliminates the need for a complex and costly relay server, providing a true all-in-one solution.
*   **Dynamic Hockey Scoreboard:** A fully customizable and draggable on-screen scoreboard designed for hockey. Control scores, game clocks, periods, and penalty timers on the fly. *The scoreboard is a UI overlay and is not yet burned into the stream.*
*   **Advanced Quality Control:** Take full command of your stream's quality with settings for Resolution (720p, 1080p), FPS (30, 60), and Bitrate.
*   **Native YouTube Integration:** Go beyond simple RTMP. Securely connect your YouTube account to:
    *   **Fetch your scheduled streams** directly from within the app.
    *   **Schedule new streams** right from the settings panel.
*   **Multi-Destination Management:** Save and manage multiple streaming destinations. Instantly switch between your pre-configured YouTube, Twitch, or other RTMP endpoints without repeatedly entering keys.
*   **Intuitive Game Controls:** A non-intrusive, slide-up control panel gives you instant access to all game management features, including team details, custom on-screen banners, and scoreboard styling.
*   **Team & Logo Libraries:** Create a library of team presets using a powerful mobile database. Load logos from your device's photo gallery and save full team profiles for quick pre-game setup.
*   **Privacy-First Diagnostics:** Troubleshoot with confidence. An in-app diagnostic logger captures warnings and errors, automatically sanitizing sensitive data like API keys before they are stored or shared.

---

## How to Run

This is a React Native project. You cannot run it in a web browser.

1.  **Prerequisites:** Make sure you have a React Native development environment set up for Android. Follow the [official React Native environment setup guide](https://reactnative.dev/docs/environment-setup).
2.  **Install Dependencies:** `npm install`
3.  **Run on Android:** `npm run android`

---

## Changelog

A summary of the major revisions and the reasoning behind them.

**v2.0.0 - The "True Native" Migration**
*   **Enhancement: Complete Rewrite to React Native.**
    *   *Reason:* The previous web-based version hit a fundamental roadblock: browsers cannot stream directly via RTMP. This required a costly and complex relay server. By migrating to a true native application, we've eliminated this requirement entirely. The app is now more stable, performant, and professional.
*   **Feature: Direct RTMP Streaming.**
    *   *Reason:* This is the core benefit of going native. Apex Play can now broadcast directly from the device to platforms like YouTube and Twitch, making it a complete, self-contained streaming solution.
*   **Enhancement: Native UI & Hardware Access.**
    *   *Reason:* All UI components have been replaced with their native counterparts for a smoother, more responsive experience. The app now has direct, reliable access to the camera, microphone, and device storage.
*   **Enhancement: Mobile-First Database.**
    *   *Reason:* The browser's `IndexedDB` was replaced with **Realm DB**, a powerful, fast, and reliable database designed specifically for mobile applications, ensuring data for teams, logos, and settings is persistent and performant.

(Previous changelog versions for the web app have been archived.)
