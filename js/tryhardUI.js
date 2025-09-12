// js/tryhardUI.js
import { isTryhardModeEnabled, calculateSilverStats } from './tryhardState.js';

export function updateSilverDisplay() {
    const silverTracker = document.getElementById('silverTracker');
    if (isTryhardModeEnabled()) {
        const { totalSilver, silverPerHour } = calculateSilverStats();
        document.getElementById('totalSilver').textContent = totalSilver.toLocaleString();
        document.getElementById('silverPerHour').textContent = silverPerHour.toLocaleString();
        silverTracker.classList.remove('hidden');
    } else {
        silverTracker.classList.add('hidden');
    }
}

export function addTryhardSettings(modalContent) {
    const tryhardSection = document.createElement('div');
    tryhardSection.className = 'border-b pb-6 mb-6 dark:border-gray-600';
    tryhardSection.innerHTML = `
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Gameplay Mode</h3>
        <label for="tryhardModeToggle" class="flex items-center cursor-pointer">
            <div class="relative">
                <input type="checkbox" id="tryhardModeToggle" class="sr-only" ${isTryhardModeEnabled() ? 'checked' : ''}>
                <div class="toggle-bg block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div class="toggle-dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full"></div>
            </div>
            <div class="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                Enable Tryhard Mode
            </div>
        </label>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Track silver and time for specific tasks to calculate your efficiency.</p>
    `;
    modalContent.appendChild(tryhardSection);
}