// js/app.js
import { updateThemeIcon, updateContent, populateSettingsModal, closeModal, updateCountdown } from './ui.js';
import { 
    autoResetTasks, resetAllTasks, saveSettings, exportData, importData,
    clearAllData, clearPwaCache
} from './state.js';
import { showAlert, showTimeInputModal, initModalElements } from './modal.js';
import { fullTaskData } from './data.js';
import { isTryhardModeEnabled, saveTryhardTask, removeTryhardTask } from './tryhardState.js';
import { initMarketPanel } from './market.js';

document.addEventListener('DOMContentLoaded', () => {

    let isEditMode = false;
    let sortableInstances = {};
    
    initModalElements();

    // --- Main DOM References ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const resetButton = document.getElementById('resetButton');
    const settingsModal = document.getElementById('settingsModal');
    const modalContent = document.getElementById('modalContent');
    const settingsButton = document.getElementById('settingsButton');
    const closeModalButton = document.getElementById('closeModalButton');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const editOrderButton = document.getElementById('editOrderButton');
    const resetOrderButton = document.getElementById('resetOrderButton');
    const mainContent = document.getElementById('main-content');
    const importFileInput = document.getElementById('importFileInput');
    const installAppButton = document.getElementById('installAppButton');
    const installAppiOSButton = document.getElementById('installAppiOSButton');

    // --- Market Panel DOM References ---
    const marketPanel = document.getElementById('marketPanel');
    const marketButton = document.getElementById('marketButton');
    const closeMarketButton = document.getElementById('closeMarketButton');
    const marketPanelContent = document.getElementById('marketPanelContent');

    const containers = {
        daily: document.getElementById('dailyContent'),
        monday: document.getElementById('mondayWeeklyContent'),
        sunday: document.getElementById('sundayWeeklyContent'),
        dungeons: document.getElementById('dungeons'),
        thursdayBosses: document.getElementById('thursdayBosses'),
        thursdayShop: document.getElementById('thursdayShop'),
        thursdayGrinds: document.getElementById('thursdayGrinds'),
    };
    const taskContainers = Object.values(containers);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered successfully:', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    }

    const updateAllContent = () => updateContent(containers);
    const closeTheModal = () => closeModal(settingsModal, settingsButton);

    async function handleTaskClick(event) {
        const card = event.target.closest('.task-card');
        if (!card || isEditMode) return;

        const taskName = card.dataset.taskName;
        const taskData = Object.values(fullTaskData).flat().find(t => t.name === taskName);
        const isDone = card.classList.contains('task-completed');

        if (isDone) {
            card.classList.remove('task-completed');
            localStorage.removeItem(taskName);
            if (taskData && taskData.isTryhard) {
                removeTryhardTask(taskName);
            }
        } else {
            if (isTryhardModeEnabled() && taskData && taskData.isTryhard) {
                const timeInSeconds = await showTimeInputModal();
                if (timeInSeconds !== null && timeInSeconds > 0) {
                    saveTryhardTask(taskName, timeInSeconds);
                    card.classList.add('task-completed');
                    localStorage.setItem(taskName, 'true');
                } else if (timeInSeconds !== null) {
                    showAlert("Invalid Time", "Time must be greater than 0 seconds.");
                }
            } else {
                card.classList.add('task-completed');
                localStorage.setItem(taskName, 'true');
            }
        }
        updateAllContent();
    }

    function toggleEditMode() {
        isEditMode = !isEditMode;
        mainContent.classList.toggle('edit-mode', isEditMode);
        document.getElementById('editIcon').classList.toggle('hidden', isEditMode);
        document.getElementById('saveIcon').classList.toggle('hidden', !isEditMode);
        resetOrderButton.classList.toggle('hidden', !isEditMode);

        if (isEditMode) {
            taskContainers.forEach(container => {
                if (container) {
                    sortableInstances[container.id] = new Sortable(container, { animation: 150, ghostClass: 'sortable-ghost' });
                }
            });
        } else {
            const newOrder = {};
            taskContainers.forEach(container => {
                if (container && sortableInstances[container.id]) {
                    const cards = container.querySelectorAll('.task-card');
                    newOrder[container.id] = Array.from(cards).map(card => card.dataset.taskName);
                    sortableInstances[container.id].destroy();
                }
            });
            localStorage.setItem('taskOrder', JSON.stringify(newOrder));
            sortableInstances = {};
            updateAllContent();
        }
    }

    function resetTaskOrder() {
        localStorage.removeItem('taskOrder');
        updateAllContent();
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon(themeToggleDarkIcon, themeToggleLightIcon);
    });
    
    resetButton.addEventListener('click', () => resetAllTasks(resetButton, updateAllContent));
    
    settingsButton.addEventListener('click', () => {
        populateSettingsModal(modalContent);
        settingsModal.classList.remove('hidden');
    });

    closeModalButton.addEventListener('click', closeTheModal);
    saveSettingsButton.addEventListener('click', () => saveSettings(modalContent, closeTheModal, updateAllContent));
    editOrderButton.addEventListener('click', toggleEditMode);
    resetOrderButton.addEventListener('click', resetTaskOrder);
    
    taskContainers.forEach(container => {
        if (container) container.addEventListener('click', handleTaskClick);
    });
    
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeTheModal(); });
    
    modalContent.addEventListener('click', async (e) => {
        const button = e.target.closest('[data-action]');
        if (button) {
            e.preventDefault();
            const action = button.dataset.action;
            const checkboxes = button.closest('.flex').parentElement.nextElementSibling.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = (action === 'check'));
            return;
        }
        
        switch (e.target.id) {
            case 'exportDataButton': exportData(); break;
            case 'importDataButton': importFileInput.click(); break;
            case 'clearDataButton': await clearAllData(); break;
            case 'clearCacheButton': await clearPwaCache(); break;
        }
    });

    importFileInput.addEventListener('change', importData);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) closeTheModal(); });

    let deferredInstallPrompt = null;
    const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (!isIOS() && !isStandalone()) {
            installAppButton.classList.remove('hidden');
        }
    });

    installAppButton.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            installAppButton.classList.add('hidden');
        }
    });
    
    installAppiOSButton.addEventListener('click', () => {
        showAlert('Install on iPhone', 'To install this app on your iPhone: Tap the "Share" icon and then select "Add to Home Screen".');
    });

    window.addEventListener('appinstalled', () => {
         deferredInstallPrompt = null;
         installAppButton.classList.add('hidden');
         console.log('BDO Tracker was installed.');
    });

    updateThemeIcon(themeToggleDarkIcon, themeToggleLightIcon);
    autoResetTasks();
    updateAllContent();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initMarketPanel(marketPanel, marketButton, closeMarketButton, marketPanelContent);
    if (isIOS() && !isStandalone()) {
        installAppiOSButton.classList.remove('hidden');
    }
});