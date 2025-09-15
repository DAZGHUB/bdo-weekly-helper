<div align="center">
<img src="https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/icons/icon-512x512.png" alt="Liana's Ledger Logo" width="128">
<h1>Liana's Ledger</h1>
<p>
A personalized and feature-rich Progressive Web App (PWA) to help Black Desert Online players keep track of their daily and weekly in-game tasks.
</p>
</div>

## ✨ Features

* **Progressive Web App (PWA):** Installable on desktop and mobile for an offline-ready, native-app experience.
* **Comprehensive Task Lists:** Tasks organized by their reset schedules: Daily, Monday, Sunday, and Thursday.
* **Interactive Checklist:** Click any task card to mark it as complete. Your progress is saved automatically to your browser's `localStorage`.
* **Detailed Reset Timers:** Headers for each section show the exact date of the next reset, plus a live countdown.
* **Light & Dark Mode:** Includes a theme toggle and respects your system's default preference.
* **Fully Customizable:**
    * **Task Visibility:** Use the settings menu (⚙️ icon) to show or hide specific tasks.
    * **Custom Task Order:** An "Edit Mode" (☰ icon) allows you to drag and drop tasks into any order you prefer.
* **Data Management:**
    * Export all your settings and progress to a file for backup.
    * Import your data to sync across different devices or browsers.
* **Black Shrine Calculator:** A detailed modal to calculate silver from weekly boss blitz runs, using live market data for accuracy.
* **Fish Sale Tracker (OCR):** Automatically read your fishing profits from a pasted screenshot using in-browser Optical Character Recognition.
* **Live Market Panel:** A slide-out panel to check the live Central Market prices for key items, supporting both NA and EU regions.
* **Tryhard Mode:** An optional mode to track silver and time for specific high-value tasks, calculating your silver-per-hour efficiency.
* **Premium Code System:** Unlock a special "Premium User" badge by entering a secret code, which is verified using a local SHA-256 hash check.

## 🛠️ Technologies Used

* **HTML5 & CSS3:** For structure and styling.
* **Tailwind CSS:** For a modern, utility-first approach to design.
* **Vanilla JavaScript (ES6 Modules):** All application logic is written in modern, modular JavaScript with no frameworks.
* **SortableJS:** A lightweight library for the drag-and-drop functionality.
* **Tesseract.js:** An OCR library used to read text from images directly in the browser.
* **PWA Technologies:** Service Workers and a Web App Manifest for an installable, offline-first experience.
