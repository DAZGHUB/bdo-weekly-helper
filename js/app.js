import { updateThemeIcon, updateContent, populateSettingsModal, closeModal, updateCountdown } from './ui.js';
import { 
    autoResetTasks, resetAllTasks, saveSettings, exportData, importData,
    clearAllData, clearPwaCache
} from './state.js';
import { showAlert, initModalElements } from './modal.js';
import { fullTaskData } from './data.js';
import { isTryhardModeEnabled, saveTryhardTask, removeTryhardTask } from './tryhardState.js';
import { initMarketPanel } from './market.js';
import { showBlackShrineModal } from './blackShrineUI.js';
import { calculateBlackShrineRun } from './blackShrineLogic.js';
import { initFishTracker } from './fishTracker.js';
import { initPremiumFeatures, checkCode, isPremium } from './premium.js';

document.addEventListener('DOMContentLoaded', () => {
    initPremiumFeatures();
    let isEditMode = false;
    let sortableInstances = {};
    initModalElements();

    const premiumStatusArea = document.getElementById('premiumStatus');
    const premiumModal = document.getElementById('premiumModal');
    const premiumCodeInput = document.getElementById('premiumCodeInput');
    const premiumSubmitBtn = document.getElementById('premiumSubmitBtn');
    const premiumCancelBtn = document.getElementById('premiumCancelBtn');
    const premiumMessage = document.getElementById('premiumMessage');
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
    const marketPanel = document.getElementById('marketPanel');
    const marketButton = document.getElementById('marketButton');
    const closeMarketButton = document.getElementById('closeMarketButton');
    const marketPanelContent = document.getElementById('marketPanelContent');
    const fishTrackerPanel = document.getElementById('fishTrackerPanel');
    const fishTrackerButton = document.getElementById('fishTrackerButton');
    const closeFishTrackerButton = document.getElementById('closeFishTrackerButton');
    const fishPasteArea = document.getElementById('fishPasteArea');
    const fishImagePreview = document.getElementById('fishImagePreview');
    const fishProcessingStatus = document.getElementById('fishProcessingStatus');
    const fishDataEntry = document.getElementById('fishDataEntry');
    const fishSilverInput = document.getElementById('fishSilverInput');
    const fishHoursInput = document.getElementById('fishHoursInput');
    const saveFishSaleButton = document.getElementById('saveFishSaleButton');
    const fishHistoryList = document.getElementById('fishHistoryList');
    const fishStatsContainer = document.getElementById('fishStatsContainer');
    const clearFishHistoryButton = document.getElementById('clearFishHistoryButton');

    const containers = {
        daily: document.getElementById('daily-content-wrapper'),
        monday: document.getElementById('monday-content-wrapper'),
        sunday: document.getElementById('sunday-content-wrapper'),
        thursday: document.getElementById('thursday-content-wrapper'),
    };

    const updateAllContent = () => updateContent(containers);
    const closeTheModal = () => closeModal(settingsModal, settingsButton);

    async function handleTaskClick(event) {
        const card = event.target.closest('.task-card');
        if (!card || isEditMode) return;
        const taskName = card.dataset.taskName;
        const isDone = card.classList.contains('task-completed');
        if (isDone) {
            card.classList.remove('task-completed');
            localStorage.removeItem(taskName);
            removeTryhardTask(taskName);
        } else {
            if (isTryhardModeEnabled() && taskName === 'LOML Party Black Shrine') {
                const runData = await showBlackShrineModal();
                if (runData && runData.length > 0) {
                    const stats = await calculateBlackShrineRun(runData);
                    saveTryhardTask(taskName, stats);
                    card.classList.add('task-completed');
                    localStorage.setItem(taskName, 'true');
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
            document.querySelectorAll('[id$="-grid"]').forEach(container => {
                if (container) {
                    sortableInstances[container.id] = new Sortable(container, { animation: 150, ghostClass: 'sortable-ghost' });
                }
            });
        } else {
            const newOrder = JSON.parse(localStorage.getItem('taskOrder')) || {};
            document.querySelectorAll('[id$="-grid"]').forEach(container => {
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
    
    mainContent.addEventListener('click', handleTaskClick);
    
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeTheModal(); });
    
    modalContent.addEventListener('click', async (e) => {
        const button = e.target.closest('[data-action]');
        if (button) {
            e.preventDefault();
            const action = button.dataset.action;
            const headerDiv = button.closest('.flex.justify-between');
            if (headerDiv) {
                const checkboxContainer = headerDiv.nextElementSibling;
                const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => checkbox.checked = (action === 'check'));
            }
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

    premiumStatusArea.addEventListener('click', () => {
        if (!isPremium()) {
            premiumCodeInput.value = '';
            premiumMessage.textContent = '';
            premiumModal.classList.remove('hidden');
            premiumCodeInput.focus();
        }
    });

    const closePremiumModal = () => premiumModal.classList.add('hidden');

    premiumSubmitBtn.addEventListener('click', () => {
        if (checkCode(premiumCodeInput.value)) {
            closePremiumModal();
        } else {
            premiumMessage.textContent = 'Invalid Code.';
        }
    });
    
    premiumCodeInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') premiumSubmitBtn.click();
    });
    
    premiumCancelBtn.addEventListener('click', closePremiumModal);

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
    });

    updateThemeIcon(themeToggleDarkIcon, themeToggleLightIcon);
    autoResetTasks();
    updateAllContent();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initMarketPanel(marketPanel, marketButton, closeMarketButton, marketPanelContent);
    initFishTracker(
        fishTrackerPanel, fishTrackerButton, closeFishTrackerButton, fishPasteArea,
        fishImagePreview, fishProcessingStatus, fishDataEntry, fishSilverInput,
        fishHoursInput, saveFishSaleButton, fishHistoryList, fishStatsContainer,
        clearFishHistoryButton
    );
    if (isIOS() && !isStandalone()) {
        installAppiOSButton.classList.remove('hidden');
    }
});