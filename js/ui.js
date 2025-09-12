// js/ui.js
import { fullTaskData } from './data.js';
import { getVisibleTasks } from './state.js';
import { addTryhardSettings, updateSilverDisplay } from './tryhardUI.js';
import { addMarketSettings } from './market.js';

export function updateThemeIcon(darkIcon, lightIcon) {
    if (document.documentElement.classList.contains('dark')) {
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
    } else {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
    }
}

function createTaskList(container, tasks) {
    if (!container) return;

    const customOrder = JSON.parse(localStorage.getItem('taskOrder')) || {};
    const categoryOrder = customOrder[container.id];
    
    let sortedTasks = [...tasks];
    if (categoryOrder) {
        sortedTasks.sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.name);
            const indexB = categoryOrder.indexOf(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }

    const visibleTasks = getVisibleTasks();
    const tasksToShow = sortedTasks.filter(task => visibleTasks.includes(task.name));
    
    container.innerHTML = '';
    if (tasksToShow.length === 0 && tasks.length > 0) {
         container.innerHTML = `<p class="text-gray-500 dark:text-gray-400 col-span-full">No tasks selected for this section. Click the gear icon to change this.</p>`;
        return;
    }

    tasksToShow.forEach(task => {
        const isDone = localStorage.getItem(task.name) === 'true';
        const taskCard = document.createElement('div');
        taskCard.className = `task-card bg-white dark:bg-gray-800 ${isDone ? 'task-completed' : ''}`;
        taskCard.dataset.taskName = task.name;
        taskCard.innerHTML = `<div class="task-top" style="background-image: url('${task.image}');"></div><div class="task-bottom"><span class="task-name">${task.name}</span></div>`;
        container.appendChild(taskCard);
    });
}

export function updateContent(containers) {
    createTaskList(containers.daily, fullTaskData.dailyContent);
    createTaskList(containers.monday, fullTaskData.mondayWeeklyContent);
    createTaskList(containers.sunday, fullTaskData.sundayWeeklyContent);
    createTaskList(containers.dungeons, fullTaskData.dungeons);
    createTaskList(containers.thursdayBosses, fullTaskData.thursdayBosses);
    createTaskList(containers.thursdayShop, fullTaskData.thursdayShop);
    createTaskList(containers.thursdayGrinds, fullTaskData.thursdayGrinds);
    updateSilverDisplay();
}

export function populateSettingsModal(modalContent) {
    modalContent.innerHTML = '';
    
    addMarketSettings(modalContent);
    addTryhardSettings(modalContent);

    // --- Task Visibility Section ---
    const visibilitySection = document.createElement('div');
    visibilitySection.className = 'border-b pb-6 mb-6 dark:border-gray-600';
    visibilitySection.innerHTML = `<h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Customize Visible Tasks</h3>`;

    const visibleTasks = getVisibleTasks();
    const categoryTitles = {
        dailyContent: 'Daily Resets (2am UTC)',
        mondayWeeklyContent: 'Monday Resets',
        sundayWeeklyContent: 'Sunday Resets',
        thursdayBosses: 'Thursday Resets - Bosses',
        thursdayShop: 'Thursday Resets - Shop & Exchange',
        dungeons: 'Thursday Resets - Dungeons',
        thursdayGrinds: 'Thursday Resets - Grinds'
    };
    for (const category in fullTaskData) {
        if (!fullTaskData[category] || fullTaskData[category].length === 0) continue;
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center border-b pb-2 mb-3 dark:border-gray-600';
        header.innerHTML = `<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">${categoryTitles[category]}</h3><div class="flex space-x-4"><button data-action="check" class="text-sm font-medium text-blue-600 dark:text-gray-400 hover:underline">Check All</button><button data-action="uncheck" class="text-sm font-medium text-blue-600 dark:text-gray-400 hover:underline">Uncheck All</button></div>`;
        visibilitySection.appendChild(header);
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2';
        fullTaskData[category].forEach(task => {
            const isChecked = visibleTasks.includes(task.name);
            const taskId = task.name.replace(/[^a-zA-Z0-9]/g, '-');
            const wrapper = document.createElement('div');
            wrapper.className = 'flex items-center';
            wrapper.innerHTML = `<input type="checkbox" id="${taskId}" value="${task.name}" ${isChecked ? 'checked' : ''} class="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-600"><label for="${taskId}" class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">${task.name}</label>`;
            grid.appendChild(wrapper);
        });
        visibilitySection.appendChild(grid);
    }
    modalContent.appendChild(visibilitySection);

    // --- Data Management Section ---
    const dataManagementSection = document.createElement('div');
    dataManagementSection.className = 'dark:border-gray-600';
    dataManagementSection.innerHTML = `
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Data Management</h3>
        <div class="flex flex-wrap gap-4">
            <button id="exportDataButton" class="bg-blue-500 hover:bg-blue-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Export Data</button>
            <button id="importDataButton" class="bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Import Data</button>
            <button id="clearDataButton" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Clear All Data</button>
            <button id="clearCacheButton" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Clear Cache & Reload</button>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            "Clear All Data" resets progress and settings. "Clear Cache" forces the app to re-download its files.
        </p>
    `;
    modalContent.appendChild(dataManagementSection);
}

export function closeModal(settingsModal, settingsButton) {
    settingsModal.classList.add('hidden');
    if (settingsButton) {
        settingsButton.blur();
    }
}

export function updateCountdown() {
    const now = new Date();
    const nowUTC = now.getTime();

    let nextDailyReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 2, 0, 0, 0));
    if (nowUTC >= nextDailyReset.getTime()) {
        nextDailyReset.setUTCDate(nextDailyReset.getUTCDate() + 1);
    }
    const dailyDiff = nextDailyReset.getTime() - nowUTC;
    const dailyHours = Math.floor((dailyDiff % 86400000) / 3600000);
    const dailyMinutes = Math.floor((dailyDiff % 3600000) / 60000);
    const dailySeconds = Math.floor((dailyDiff % 60000) / 1000);
    document.getElementById('daily-countdown').innerHTML = `(Resets in ${dailyHours}h ${dailyMinutes}m ${dailySeconds}s)`;

    const nextMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    nextMonday.setUTCHours(0, 0, 0, 0);
    nextMonday.setUTCDate(nextMonday.getUTCDate() + (1 - nextMonday.getUTCDay() + 7) % 7);
    if (nextMonday.getTime() < now.getTime()) {
        nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    }
    const mondayDiff = nextMonday.getTime() - now.getTime();
    const mondayDays = Math.floor(mondayDiff / 86400000);
    const mondayHours = Math.floor((mondayDiff % 86400000) / 3600000);
    const mondayMinutes = Math.floor((mondayDiff % 3600000) / 60000);
    const mondaySeconds = Math.floor((mondayDiff % 60000) / 1000);
    document.getElementById('monday-countdown').innerHTML = `(Resets in ${mondayDays}d ${mondayHours}h ${mondayMinutes}m ${mondaySeconds}s)`;

    const nextThursday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    nextThursday.setUTCHours(0, 0, 0, 0);
    nextThursday.setUTCDate(nextThursday.getUTCDate() + (4 - nextThursday.getUTCDay() + 7) % 7);
    if (nextThursday.getTime() < now.getTime()) {
        nextThursday.setUTCDate(nextThursday.getUTCDate() + 7);
    }
    const thursdayDiff = nextThursday.getTime() - now.getTime();
    const thursdayDays = Math.floor(thursdayDiff / 86400000);
    const thursdayHours = Math.floor((thursdayDiff % 86400000) / 3600000);
    const thursdayMinutes = Math.floor((thursdayDiff % 3600000) / 60000);
    const thursdaySeconds = Math.floor((thursdayDiff % 60000) / 1000);
    document.getElementById('thursday-countdown').innerHTML = `(Resets in ${thursdayDays}d ${thursdayHours}h ${thursdayMinutes}m ${thursdaySeconds}s)`;
    
    const nextSunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    nextSunday.setUTCHours(0, 0, 0, 0);
    nextSunday.setUTCDate(nextSunday.getUTCDate() + (7 - nextSunday.getUTCDay()) % 7);
     if (nextSunday.getTime() < now.getTime()) {
        nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);
    }
    const sundayDiff = nextSunday.getTime() - now.getTime();
    const sundayDays = Math.floor(sundayDiff / 86400000);
    const sundayHours = Math.floor((sundayDiff % 86400000) / 3600000);
    const sundayMinutes = Math.floor((sundayDiff % 3600000) / 60000);
    const sundaySeconds = Math.floor((sundayDiff % 60000) / 1000);
    document.getElementById('sunday-countdown').innerHTML = `(Resets in ${sundayDays}d ${sundayHours}h ${sundayMinutes}m ${sundaySeconds}s)`;
}