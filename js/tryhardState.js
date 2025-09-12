// js/tryhardState.js
import { fullTaskData } from './data.js';

// --- State Accessors ---
export const isTryhardModeEnabled = () => localStorage.getItem('tryhardModeEnabled') === 'true';
export const setTryhardMode = (isEnabled) => localStorage.setItem('tryhardModeEnabled', isEnabled);
const getTryhardData = () => JSON.parse(localStorage.getItem('tryhardData')) || {};
const saveTryhardData = (data) => localStorage.setItem('tryhardData', JSON.stringify(data));

// --- Data Manipulation ---
export function saveTryhardTask(taskName, timeInSeconds) {
    const data = getTryhardData();
    data[taskName] = { time: timeInSeconds };
    saveTryhardData(data);
}

export function removeTryhardTask(taskName) {
    const data = getTryhardData();
    delete data[taskName];
    saveTryhardData(data);
}

export function clearAllTryhardData() {
    localStorage.removeItem('tryhardData');
}

// --- Calculations ---
export function calculateSilverStats() {
    let totalSilver = 0;
    let totalSeconds = 0;
    const tryhardData = getTryhardData();
    const allTasks = Object.values(fullTaskData).flat();

    for (const task of allTasks) {
        if (task.isTryhard && localStorage.getItem(task.name) === 'true' && tryhardData[task.name]) {
            totalSilver += task.silver;
            totalSeconds += tryhardData[task.name].time;
        }
    }

    const silverPerHour = totalSeconds > 0 ? Math.round((totalSilver / totalSeconds) * 3600) : 0;
    
    return { totalSilver, silverPerHour };
}