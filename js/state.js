// js/state.js
import { fullTaskData } from './data.js';
import { showConfirmation, showAlert } from './modal.js';
import { setTryhardMode, clearAllTryhardData } from './tryhardState.js';

let resetConfirmationTimeout = null;

export function getVisibleTasks() {
    const allCurrentTaskNames = Object.values(fullTaskData).flat().map(task => task.name);
    const storedVisible = localStorage.getItem('visibleTasks');

    // If the user has never saved settings, all tasks are visible by default
    if (!storedVisible) {
        return allCurrentTaskNames;
    }

    // If they have saved settings, we merge their choices with any new tasks
    const savedVisibleTasks = JSON.parse(storedVisible);
    const allTasksAtLastSave = JSON.parse(localStorage.getItem('allTasksAtLastSave')) || [];
    
    // "New" tasks are any tasks in the current data that didn't exist when the user last saved
    const newTasks = allCurrentTaskNames.filter(task => !allTasksAtLastSave.includes(task));

    // The final list is a combination of the user's saved preferences and any new tasks
    const finalVisibleTasks = new Set([...savedVisibleTasks, ...newTasks]);

    // We also filter the final list to ensure we don't show tasks that have been removed from the app data
    return allCurrentTaskNames.filter(task => finalVisibleTasks.has(task));
}

export function autoResetTasks() {
    const now = new Date();
    const nowUTC = now.getTime();

    // Daily Reset Logic
    const lastDailyResetTime = parseInt(localStorage.getItem('lastDailyResetTime') || '0');
    let nextDailyReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 2, 0, 0, 0));
    if (nowUTC < nextDailyReset.getTime()) {
        nextDailyReset.setUTCDate(nextDailyReset.getUTCDate() - 1);
    }
    if (lastDailyResetTime < nextDailyReset.getTime()) {
        fullTaskData.dailyContent.forEach(task => localStorage.removeItem(task.name));
        localStorage.setItem('lastDailyResetTime', nextDailyReset.getTime());
        console.log("Daily tasks have been reset.");
    }

    // Monday Reset Logic
    const lastMondayResetTime = parseInt(localStorage.getItem('lastMondayResetTime') || '0');
    const lastMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    lastMonday.setUTCDate(lastMonday.getUTCDate() - (lastMonday.getUTCDay() - 1 + 7) % 7);
    lastMonday.setUTCHours(0, 0, 0, 0);
    if (lastMondayResetTime < lastMonday.getTime()) {
        fullTaskData.mondayWeeklyContent.forEach(task => localStorage.removeItem(task.name));
        localStorage.setItem('lastMondayResetTime', lastMonday.getTime());
        console.log("Monday tasks have been reset.");
    }

    // Thursday Reset Logic
    const lastThursdayResetTime = parseInt(localStorage.getItem('lastThursdayResetTime') || '0');
    const lastThursday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    lastThursday.setUTCDate(lastThursday.getUTCDate() - (lastThursday.getUTCDay() - 4 + 7) % 7);
    lastThursday.setUTCHours(0, 0, 0, 0);
    if (lastThursdayResetTime < lastThursday.getTime()) {
        const tasksToReset = [
            ...fullTaskData.dungeons, 
            ...fullTaskData.thursdayBosses, 
            ...fullTaskData.thursdayGrinds, 
            ...fullTaskData.thursdayShop
        ];
        tasksToReset.forEach(task => localStorage.removeItem(task.name));
        clearAllTryhardData();
        localStorage.setItem('lastThursdayResetTime', lastThursday.getTime());
        console.log("Thursday tasks have been reset.");
    }

    // Sunday Reset Logic
    const lastSundayResetTime = parseInt(localStorage.getItem('lastSundayResetTime') || '0');
    const lastSunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    lastSunday.setUTCDate(lastSunday.getUTCDate() - (lastSunday.getUTCDay() + 7) % 7);
    lastSunday.setUTCHours(0, 0, 0, 0);
    if (lastSundayResetTime < lastSunday.getTime()) {
        fullTaskData.sundayWeeklyContent.forEach(task => localStorage.removeItem(task.name));
        clearAllTryhardData();
        localStorage.setItem('lastSundayResetTime', lastSunday.getTime());
        console.log("Sunday tasks have been reset.");
    }
}

export function resetAllTasks(resetButton, updateContentCallback) {
    if (resetButton.dataset.confirm === 'true') {
        Object.values(fullTaskData).flat().forEach(task => localStorage.removeItem(task.name));
        clearAllTryhardData();
        updateContentCallback();
        resetButton.dataset.confirm = 'false';
        resetButton.textContent = 'Reset All Tasks';
        resetButton.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        resetButton.classList.add('bg-red-500', 'hover:bg-red-600');
        clearTimeout(resetConfirmationTimeout);
    } else {
        resetButton.dataset.confirm = 'true';
        resetButton.textContent = 'Are you sure? Click again to reset.';
        resetButton.classList.remove('bg-red-500', 'hover:bg-red-600');
        resetButton.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        resetConfirmationTimeout = setTimeout(() => {
            resetButton.dataset.confirm = 'false';
            resetButton.textContent = 'Reset All Tasks';
            resetButton.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
            resetButton.classList.add('bg-red-500', 'hover:bg-red-600');
        }, 5000);
    }
}

export function saveSettings(modalContent, closeModalCallback, updateContentCallback) {
    // Save the user's choices for visible tasks
    const checkboxes = modalContent.querySelectorAll('input[type="checkbox"]:checked');
    const visibleTasks = Array.from(checkboxes).map(cb => cb.value);
    localStorage.setItem('visibleTasks', JSON.stringify(visibleTasks));

    // Save the master list of tasks that existed at the time of saving
    const allTaskNames = Object.values(fullTaskData).flat().map(task => task.name);
    localStorage.setItem('allTasksAtLastSave', JSON.stringify(allTaskNames));

    // Save Tryhard Mode toggle
    const tryhardToggle = document.getElementById('tryhardModeToggle');
    if (tryhardToggle) {
        setTryhardMode(tryhardToggle.checked);
    }

    // Save Market Region
    const regionSelector = modalContent.querySelector('input[name="marketRegion"]:checked');
    if (regionSelector) {
        localStorage.setItem('marketRegion', regionSelector.value);
    }

    closeModalCallback();
    updateContentCallback();
}

export function exportData() {
    const dataToExport = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        dataToExport[key] = localStorage.getItem(key);
    }

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bdo-tracker-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (typeof importedData !== 'object' || importedData === null) {
                throw new Error("Invalid data format");
            }
            localStorage.clear();
            Object.keys(importedData).forEach(key => localStorage.setItem(key, importedData[key]));

            const importButton = document.getElementById('importDataButton');
            if (importButton) {
                importButton.textContent = 'Success! Reloading...';
                importButton.classList.add('bg-green-500');
            }
            setTimeout(() => location.reload(), 1000);

        } catch (error) {
            console.error("Failed to import data:", error);
            showAlert('Import Failed', 'The selected file was not valid. Please try another backup file.');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

export async function clearAllData() {
    const confirmed = await showConfirmation(
        'Confirm Deletion', 
        'Are you sure you want to delete all your data? This will reset task progress, settings, and all Tryhard Mode stats. This action cannot be undone.'
    );
    if (confirmed) {
        localStorage.clear();
        await showAlert('Success', 'All data has been cleared. The application will now reload.');
        location.reload();
    }
}

export async function clearPwaCache() {
    if ('caches' in window) {
        const confirmed = await showConfirmation(
            'Confirm Cache Clearing',
            'Are you sure you want to clear the cache? The app will re-download all its files. This is useful for forcing an update.'
        );
        if (confirmed) {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
                await showAlert('Success', 'Cache has been cleared. The application will now reload.');
                location.reload();
            } catch (error) {
                console.error('Error clearing cache:', error);
                await showAlert('Error', 'Failed to clear the cache. Check the console for details.');
            }
        }
    } else {
        await showAlert('Unsupported Feature', 'The Cache API is not supported in this browser.');
    }
}