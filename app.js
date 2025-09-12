// Main application logic script
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM ELEMENT REFERENCES ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const resetButton = document.getElementById('resetButton');
    const settingsModal = document.getElementById('settingsModal');
    const modalContent = document.getElementById('modalContent');
    const settingsButton = document.getElementById('settingsButton');
    const closeModalButton = document.getElementById('closeModalButton');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const sundayContainer = document.getElementById('sundayWeeklyContent');
    const dungeonsContainer = document.getElementById('dungeons');
    const grindsContainer = document.getElementById('weeklyGrinds');
    const editOrderButton = document.getElementById('editOrderButton');
    const mainContent = document.getElementById('main-content');
    const importFileInput = document.getElementById('importFileInput');
    
    // --- STATE & DATA ---
    let resetConfirmationTimeout = null;
    let isEditMode = false;
    let sortableInstances = {};
    const fullTaskData = {
        sundayWeeklyContent: [
            { name: 'Vell World Boss', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/vell.png' },
            { name: 'Garmoth World Boss', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/garmoth.png' },
            { name: 'Imperial Crafting Delivery', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/imperial.png' },
        ],
        dungeons: [
            { name: 'Atoraxxion Dungeon (First Run)', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/ato.png' },
            { name: 'Atoraxxion Dungeon (2nd Run)', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/ato.png' },
            { name: 'Pit of the Undying', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/pit.png' },
            { name: 'LOML Party Black Shrine', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/loml_party.png' },
            { name: 'LOML Solo Black Shrine', image: 'https://placehold.co/300x200/4b5563/ffffff?text=Shrine' }
        ],
        weeklyGrinds: [
            { name: 'The Final Gladios', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/redheart.png' },
            { name: 'Liana\'s Weekly Shop', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/liana.png' },
            { name: 'Edana Boss Fight', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/edania_bosses.png' },
            { name: 'Weekly Grind: Aetherion Castle', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/aetherion.png' },
            { name: 'Weekly Grind: Nymphamaré Castle', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/nymphamar%C3%A9.png' },
            { name: 'Weekly Grind: Orbita Castle', image: 'https://placehold.co/300x200/4b5563/ffffff?text=Orbita' },
            { name: 'Weekly Grind: Tenebraum Castle', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/Tenebraum.png' },
            { name: 'Weekly Grind: Zephyros Castle', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/Zephyros.png' },
            { name: 'Weekly Fieldboss: Bulgasal', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/bulgasal.png' },
            { name: 'Weekly Fieldboss: Uturi', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/uturi.png' },
            { name: 'Weekly Fieldboss: Sangoon', image: 'https://raw.githubusercontent.com/DAZGHUB/bdo-weekly-helper/main/images/sangoon.png' },
            { name: 'Weekly Fieldboss: Giant Boar', image: 'https://placehold.co/300x200/4b5563/ffffff?text=Boar' }
        ]
    };
    const taskContainers = [sundayContainer, dungeonsContainer, grindsContainer];
    
    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker registered successfully:', registration))
            .catch(error => console.log('Service Worker registration failed:', error));
    }


    // --- FUNCTIONS ---
    
    function updateThemeIcon() {
        if (document.documentElement.classList.contains('dark')) {
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        } else {
            themeToggleLightIcon.classList.add('hidden');
            themeToggleDarkIcon.classList.remove('hidden');
        }
    }

    function autoResetWeeklyTasks() {
        const now = new Date();
        const lastThursday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        lastThursday.setUTCDate(lastThursday.getUTCDate() - (lastThursday.getUTCDay() - 4 + 7) % 7);
        lastThursday.setUTCHours(0, 0, 0, 0);
        const lastSunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        lastSunday.setUTCDate(lastSunday.getUTCDate() - (lastSunday.getUTCDay() + 7) % 7);
        lastSunday.setUTCHours(0, 0, 0, 0);
        const lastThursdayResetTime = parseInt(localStorage.getItem('lastThursdayResetTime') || '0');
        const lastSundayResetTime = parseInt(localStorage.getItem('lastSundayResetTime') || '0');
        if (lastThursdayResetTime < lastThursday.getTime()) {
            fullTaskData.dungeons.forEach(task => localStorage.removeItem(task.name));
            fullTaskData.weeklyGrinds.forEach(task => localStorage.removeItem(task.name));
            localStorage.setItem('lastThursdayResetTime', lastThursday.getTime());
        }
        if (lastSundayResetTime < lastSunday.getTime()) {
            fullTaskData.sundayWeeklyContent.forEach(task => localStorage.removeItem(task.name));
            localStorage.setItem('lastSundayResetTime', lastSunday.getTime());
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

    function handleTaskCompletion(event) {
        if (isEditMode) return;
        const card = event.target.closest('.task-card');
        if (card) {
            const taskName = card.dataset.taskName;
            const isDone = card.classList.toggle('task-completed');
            localStorage.setItem(taskName, isDone);
        }
    }

    function resetAllTasks() {
        if (resetButton.dataset.confirm === 'true') {
            Object.values(fullTaskData).flat().forEach(task => localStorage.removeItem(task.name));
            updateContent();
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

    function updateContent() {
        createTaskList(sundayContainer, fullTaskData.sundayWeeklyContent);
        createTaskList(dungeonsContainer, fullTaskData.dungeons);
        createTaskList(grindsContainer, fullTaskData.weeklyGrinds);
    }

    function updateCountdown() {
        const now = new Date();
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
    
    function getVisibleTasks() {
        const stored = localStorage.getItem('visibleTasks');
        return stored ? JSON.parse(stored) : Object.values(fullTaskData).flat().map(task => task.name);
    }

    function populateSettingsModal() {
        modalContent.innerHTML = '';
        const visibleTasks = getVisibleTasks();
        const categoryTitles = {
            sundayWeeklyContent: 'Sunday Resets', dungeons: 'Dungeons', weeklyGrinds: 'Weekly Grinds'
        };
        for (const category in fullTaskData) {
            if (fullTaskData[category].length === 0) continue;
            const header = document.createElement('div');
            header.className = 'flex justify-between items-center border-b pb-2 mb-3 dark:border-gray-600';
            header.innerHTML = `<h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200">${categoryTitles[category]}</h3><div class="flex space-x-4"><button data-action="check" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Check All</button><button data-action="uncheck" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Uncheck All</button></div>`;
            modalContent.appendChild(header);
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
            modalContent.appendChild(grid);
        }
        // Add Data Management section
        const dataManagementSection = document.createElement('div');
        dataManagementSection.className = 'border-t pt-6 mt-6 dark:border-gray-600';
        dataManagementSection.innerHTML = `
            <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Data Management</h3>
            <div class="flex space-x-4">
                <button id="exportDataButton" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Export Data</button>
                <button id="importDataButton" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Import Data</button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Save your settings and task progress to a file, or load them from a backup.</p>
        `;
        modalContent.appendChild(dataManagementSection);
    }
    
    function saveSettings() {
        const checkboxes = modalContent.querySelectorAll('input[type="checkbox"]:checked');
        const visibleTasks = Array.from(checkboxes).map(cb => cb.value);
        localStorage.setItem('visibleTasks', JSON.stringify(visibleTasks));
        closeModal();
        updateContent();
    }

    function closeModal() {
        settingsModal.classList.add('hidden');
        settingsButton.blur();
    }

    function toggleEditMode() {
        isEditMode = !isEditMode;
        mainContent.classList.toggle('edit-mode', isEditMode);
        document.getElementById('editIcon').classList.toggle('hidden', isEditMode);
        document.getElementById('saveIcon').classList.toggle('hidden', !isEditMode);

        if (isEditMode) {
            taskContainers.forEach(container => {
                sortableInstances[container.id] = new Sortable(container, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                });
            });
        } else {
            const newOrder = {};
            taskContainers.forEach(container => {
                if (sortableInstances[container.id]) {
                    const cards = container.querySelectorAll('.task-card');
                    newOrder[container.id] = Array.from(cards).map(card => card.dataset.taskName);
                    sortableInstances[container.id].destroy();
                }
            });
            localStorage.setItem('taskOrder', JSON.stringify(newOrder));
            sortableInstances = {};
            updateContent();
        }
    }
    
    function exportData() {
        const dataToExport = {};
        const allTaskNames = Object.values(fullTaskData).flat().map(task => task.name);

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === 'theme' || key === 'visibleTasks' || key === 'taskOrder' || key.startsWith('last') || allTaskNames.includes(key)) {
                dataToExport[key] = localStorage.getItem(key);
            }
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

    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (typeof importedData !== 'object' || importedData === null) {
                    throw new Error("Invalid data format");
                }

                Object.keys(importedData).forEach(key => {
                    localStorage.setItem(key, importedData[key]);
                });

                const importButton = document.getElementById('importDataButton');
                if (importButton) {
                    importButton.textContent = 'Success! Reloading...';
                    importButton.classList.add('bg-green-500');
                }

                setTimeout(() => {
                    location.reload();
                }, 1000);

            } catch (error) {
                console.error("Failed to import data:", error);
                const importButton = document.getElementById('importDataButton');
                if (importButton) {
                    const originalText = importButton.textContent;
                    importButton.textContent = "Import Failed!";
                    importButton.classList.remove('bg-gray-600', 'hover:bg-gray-700');
                    importButton.classList.add('bg-red-600');
                    setTimeout(() => {
                        importButton.textContent = originalText;
                        importButton.classList.add('bg-gray-600', 'hover:bg-gray-700');
                        importButton.classList.remove('bg-red-600');
                    }, 3000);
                }
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    }


    // --- EVENT LISTENERS ---
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    });
    
    resetButton.addEventListener('click', resetAllTasks);
    settingsButton.addEventListener('click', () => {
        populateSettingsModal();
        settingsModal.classList.remove('hidden');
    });
    closeModalButton.addEventListener('click', closeModal);
    saveSettingsButton.addEventListener('click', saveSettings);
    editOrderButton.addEventListener('click', toggleEditMode);
    
    taskContainers.forEach(container => {
        container.addEventListener('click', handleTaskCompletion)
    });
    
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });
    
    modalContent.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (button) {
            e.preventDefault();
            const action = button.dataset.action;
            const checkboxes = button.closest('.flex').parentElement.nextElementSibling.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = (action === 'check'));
            return;
        }
         if (e.target.id === 'exportDataButton') {
            exportData();
        }
        if (e.target.id === 'importDataButton') {
            importFileInput.click();
        }
    });

    importFileInput.addEventListener('change', importData);

    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) closeModal(); });
    
    // --- PWA Installation Logic ---
    const installAppButton = document.getElementById('installAppButton');
    const installAppiOSButton = document.getElementById('installAppiOSButton');
    let deferredInstallPrompt = null;

    // --- Utility to detect iOS ---
    function isIOS() {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // Also, iPad on iOS 13+ detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    }

    // --- Check if the app is already in standalone mode ---
    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    }

    // --- PWA Install prompt for Chromium browsers ---
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredInstallPrompt = e;
        // Show the install button if not on iOS and not already standalone
        if (!isIOS() && !isStandalone()) {
            installAppButton.classList.remove('hidden');
        }
    });

    installAppButton.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
            // Show the install prompt
            deferredInstallPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredInstallPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, hide the button
            deferredInstallPrompt = null;
            installAppButton.classList.add('hidden');
        }
    });
    
    // --- Manual install instructions for iOS Safari ---
    function showIosInstallInstructions() {
        // Here you could show a modal with instructions instead of an alert
        alert('To install this app on your iPhone: Tap the "Share" icon and then select "Add to Home Screen".');
    }
    
    installAppiOSButton.addEventListener('click', showIosInstallInstructions);


    window.addEventListener('appinstalled', () => {
         deferredInstallPrompt = null;
         installAppButton.classList.add('hidden');
         console.log('BDO Tracker was installed.');
    });

    // --- Initial check on page load ---
    function handlePwaInstallPrompts() {
        if (isIOS() && !isStandalone()) {
            installAppiOSButton.classList.remove('hidden');
        }
    }
    
    // --- INITIAL EXECUTION ---
    updateThemeIcon();
    autoResetWeeklyTasks();
    updateContent();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    handlePwaInstallPrompts();
});