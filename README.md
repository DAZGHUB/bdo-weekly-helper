<div align="center">
<h1>BDO Weekly Task Tracker</h1>
<p>
A personalized and feature-rich Progressive Web App (PWA) to help Black Desert Online players keep track of their daily and weekly in-game tasks.
</p>
</div>

## ✨ Features

* **Progressive Web App (PWA):** Installable on desktop and mobile for an offline-ready, native-app experience.
* **Comprehensive Task Lists:** Tasks organized by their reset schedules: Daily, Monday, Sunday, and Thursday.
* **Subcategories:** Weekly tasks are further organized into logical groups like Bosses, Dungeons, etc., which automatically hide if they are empty.
* **Interactive Checklist:** Click any task card to mark it as complete. Your progress is saved automatically.
* **Persistent Memory:** All progress and settings are saved in your browser's `localStorage`.
* **Detailed Reset Timers:** Headers for each section show the exact date of the next reset, plus a live countdown.
* **Light & Dark Mode:** Includes a theme toggle and respects your system's default preference.
* **Fully Customizable:**
    * **Task Visibility:** Use the settings menu (⚙️ icon) to show or hide specific tasks. New tasks added to the app are enabled by default.
    * **Custom Task Order:** An "Edit Mode" (☰ icon) allows you to drag and drop tasks into any order you prefer.
* **Data Management:**
    * Export all your settings and progress to a file for backup.
    * Import your data to sync across different devices or browsers.
    * Options to clear all data or just the application cache.
* **Tryhard Mode:**
    * An optional mode to track silver and time for specific high-value tasks.
    * Calculates and displays your total silver and silver-per-hour based on your input.
* **Live Market Panel:**
    * A slide-out panel to check the live Central Market prices for key items.
    * Supports both NA and EU regions, configurable in the settings.
    * Prices are cached for one hour to ensure good performance.
* **Fully Responsive:** Designed to work beautifully on any screen size.

## 🛠️ Technologies Used

* **HTML5 & CSS3:** For structure and styling.
* **Tailwind CSS:** For a modern, utility-first approach to design.
* **Vanilla JavaScript (ES6 Modules):** All application logic is written in modern, modular JavaScript with no frameworks.
* **SortableJS:** A lightweight library for the drag-and-drop functionality.
* **PWA Technologies:** Service Workers and a Web App Manifest for an installable, offline-first experience.