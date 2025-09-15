// js/tryhardState.js
import { fullTaskData } from './data.js';

export const isTryhardModeEnabled = () => localStorage.getItem('tryhardModeEnabled') === 'true';
export const setTryhardMode = (isEnabled) => localStorage.setItem('tryhardModeEnabled', isEnabled);
const getTryhardData = () => JSON.parse(localStorage.getItem('tryhardData')) || {};
const saveTryhardData = (data) => localStorage.setItem('tryhardData', JSON.stringify(data));

// Updated to save pre-calculated silver and time
export function saveTryhardTask(taskName, { totalSilver, totalSeconds }) {
    const data = getTryhardData();
    data[taskName] = { totalSilver, totalSeconds };
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

// Updated to simply sum up the pre-calculated data
export function calculateSilverStats() {
    let totalSilver = 0;
    let totalSeconds = 0;
    const tryhardData = getTryhardData();
    const allTasks = Object.values(fullTaskData).flatMap(Object.values).flat();

    for (const task of allTasks) {
        if (task.isTryhard && localStorage.getItem(task.name) === 'true' && tryhardData[task.name]) {
            // Read the saved calculated values
            totalSilver += tryhardData[task.name].totalSilver || 0;
            totalSeconds += tryhardData[task.name].totalSeconds || 0;
        }
    }

    const silverPerHour = totalSeconds > 0 ? Math.round((totalSilver / totalSeconds) * 3600) : 0;
    
    return { totalSilver, silverPerHour };
}