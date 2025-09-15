// js/ui.js
import { fullTaskData } from './data.js';
import { getVisibleTasks } from './state.js';
import { addTryhardSettings, updateSilverDisplay } from './tryhardUI.js';
import { addMarketSettings } from './market.js';

const SUBCATEGORY_TITLES = {
    general: 'General Tasks',
    bosses: 'Bosses',
    shop: 'Shop & Exchange',
    dungeons: 'Dungeons',
    grinds: 'Weekly Grinds',
    shrines: 'Black Shrine'
};

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
    const visibleTasks = getVisibleTasks();
    const customOrder = JSON.parse(localStorage.getItem('taskOrder')) || {};
    const categoryOrder = customOrder[container.id];
    
    let sortedTasks = [...tasks];
    if (categoryOrder) {
        sortedTasks.sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.name);
            const indexB = categoryOrder.indexOf(b.name);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
    }

    const tasksToShow = sortedTasks.filter(task => visibleTasks.includes(task.name));
    container.innerHTML = '';

    const parentSection = container.closest('.subcategory-wrapper');
    if (tasksToShow.length === 0) {
        if (parentSection) parentSection.classList.add('hidden');
        return;
    } else {
         if (parentSection) parentSection.classList.remove('hidden');
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

function renderSection(wrapperId, sectionData) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    wrapper.innerHTML = ''; 

    for (const subcategory in sectionData) {
        const tasks = sectionData[subcategory];
        const subcategoryWrapper = document.createElement('div');
        subcategoryWrapper.className = 'subcategory-wrapper';

        if (Object.keys(sectionData).length > 1 || subcategory !== 'general') {
            const title = document.createElement('h3');
            title.className = 'subcategory-title text-xl font-semibold border-b-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200';
            title.textContent = SUBCATEGORY_TITLES[subcategory] || subcategory;
            subcategoryWrapper.appendChild(title);
        }

        const gridContainer = document.createElement('div');
        gridContainer.id = `${wrapperId}-${subcategory}-grid`;
        gridContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4';
        subcategoryWrapper.appendChild(gridContainer);
        
        wrapper.appendChild(subcategoryWrapper);
        createTaskList(gridContainer, tasks);
    }
}

export function updateContent(containers) {
    renderSection('daily-content-wrapper', fullTaskData.daily);
    renderSection('monday-content-wrapper', fullTaskData.monday);
    renderSection('sunday-content-wrapper', fullTaskData.sunday);
    renderSection('thursday-content-wrapper', fullTaskData.thursday);
    updateSilverDisplay();
}

export function populateSettingsModal(modalContent) {
    modalContent.innerHTML = '';
    
    addMarketSettings(modalContent);
    addTryhardSettings(modalContent);

    const visibilitySection = document.createElement('div');
    visibilitySection.className = 'border-b pb-6 mb-6 dark:border-gray-600';
    visibilitySection.innerHTML = `<h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Customize Visible Tasks</h3>`;
    modalContent.appendChild(visibilitySection);

    const visibleTasks = getVisibleTasks();
    const categoryTitles = {
        daily: 'Daily Resets',
        monday: 'Monday Resets',
        sunday: 'Sunday Resets',
        thursday: 'Thursday Resets'
    };

    for (const categoryKey in categoryTitles) {
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mt-4 border-b pb-2 mb-3 dark:border-gray-600';
        header.innerHTML = `
            <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-200">${categoryTitles[categoryKey]}</h4>
            <div class="flex space-x-4">
                <button data-action="check" class="text-sm font-medium text-blue-600 dark:text-gray-400 hover:underline">Check All</button>
                <button data-action="uncheck" class="text-sm font-medium text-blue-600 dark:text-gray-400 hover:underline">Uncheck All</button>
            </div>
        `;
        visibilitySection.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2';
        
        const allTasksInCategory = Object.values(fullTaskData[categoryKey]).flat();
        allTasksInCategory.forEach(task => {
            const isChecked = visibleTasks.includes(task.name);
            const taskId = task.name.replace(/[^a-zA-Z0-9]/g, '-');
            const wrapper = document.createElement('div');
            wrapper.className = 'flex items-center';
            wrapper.innerHTML = `<input type="checkbox" id="${taskId}" value="${task.name}" ${isChecked ? 'checked' : ''} class="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-600"><label for="${taskId}" class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">${task.name}</label>`;
            grid.appendChild(wrapper);
        });
        visibilitySection.appendChild(grid);
    }

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
    const options = { month: 'long', day: 'numeric', year: 'numeric' };

    let nextDaily = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 2, 0, 0, 0));
    if (now.getTime() >= nextDaily.getTime()) nextDaily.setUTCDate(nextDaily.getUTCDate() + 1);
    document.getElementById('daily-date').textContent = `Resets on ${nextDaily.toLocaleDateString(undefined, options)}`;
    
    let nextMonday = new Date(now);
    nextMonday.setUTCDate(nextMonday.getUTCDate() + (1 - nextMonday.getUTCDay() + 7) % 7);
    nextMonday.setUTCHours(0, 0, 0, 0);
    if (now.getTime() >= nextMonday.getTime()) nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    document.getElementById('monday-date').textContent = `Resets on ${nextMonday.toLocaleDateString(undefined, options)}`;
    
    let nextSunday = new Date(now);
    nextSunday.setUTCDate(nextSunday.getUTCDate() + (7 - nextSunday.getUTCDay()) % 7);
    nextSunday.setUTCHours(0, 0, 0, 0);
    if (now.getTime() >= nextSunday.getTime()) nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);
    document.getElementById('sunday-date').textContent = `Resets on ${nextSunday.toLocaleDateString(undefined, options)}`;

    let nextThursday = new Date(now);
    nextThursday.setUTCDate(nextThursday.getUTCDate() + (4 - nextThursday.getUTCDay() + 7) % 7);
    nextThursday.setUTCHours(0, 0, 0, 0);
    if (now.getTime() >= nextThursday.getTime()) nextThursday.setUTCDate(nextThursday.getUTCDate() + 7);
    document.getElementById('thursday-date').textContent = `Resets on ${nextThursday.toLocaleDateString(undefined, options)}`;
    
    const dailyDiff = nextDaily.getTime() - now.getTime();
    document.getElementById('daily-countdown').textContent = `(${Math.floor((dailyDiff % 86400000) / 3600000)}h ${Math.floor((dailyDiff % 3600000) / 60000)}m ${Math.floor((dailyDiff % 60000) / 1000)}s)`;

    const mondayDiff = nextMonday.getTime() - now.getTime();
    document.getElementById('monday-countdown').textContent = `(${Math.floor(mondayDiff / 86400000)}d ${Math.floor((mondayDiff % 86400000) / 3600000)}h ${Math.floor((mondayDiff % 3600000) / 60000)}m)`;

    const sundayDiff = nextSunday.getTime() - now.getTime();
    document.getElementById('sunday-countdown').textContent = `(${Math.floor(sundayDiff / 86400000)}d ${Math.floor((sundayDiff % 86400000) / 3600000)}h ${Math.floor((sundayDiff % 3600000) / 60000)}m)`;
    
    const thursdayDiff = nextThursday.getTime() - now.getTime();
    document.getElementById('thursday-countdown').textContent = `(${Math.floor(thursdayDiff / 86400000)}d ${Math.floor((thursdayDiff % 86400000) / 3600000)}h ${Math.floor((thursdayDiff % 3600000) / 60000)}m)`;
}