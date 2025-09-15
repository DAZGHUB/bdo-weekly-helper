// js/modules/blackShrineUI.js
import { blackShrineBosses } from './blackShrineData.js';
import { calculateBlackShrineSummary } from './blackShrineLogic.js';

const modal = document.getElementById('blackShrineModal');
const container = document.getElementById('blackShrineBossesContainer');
const cancelButton = document.getElementById('blackShrineCancel');
const submitButton = document.getElementById('blackShrineSubmit');
const summarySection = document.getElementById('blackShrineSummary');
const rewardsList = document.getElementById('blackShrineRewardsList');
const totalSilverEl = document.getElementById('blackShrineTotalSilver');

let resolvePromise;

async function updateSummary() {
    const selectedUnits = container.querySelectorAll('.shrine-boss-unit.selected');
    if (selectedUnits.length === 0) {
        summarySection.classList.add('hidden');
        return;
    }
    
    summarySection.classList.remove('hidden');
    rewardsList.innerHTML = `<p class="text-gray-500">Calculating prices...</p>`;
    totalSilverEl.textContent = '...';

    const runData = collectData();
    const summary = await calculateBlackShrineSummary(runData);

    rewardsList.innerHTML = '';
    for (const key in summary.rewardsBreakdown) {
        const item = summary.rewardsBreakdown[key];
        const itemHTML = `
            <div class="flex items-center justify-between text-sm">
                <div class="flex items-center">
                    <img src="${item.icon}" class="w-8 h-8 mr-3 rounded">
                    <span>${item.name} x${item.quantity.toLocaleString()}</span>
                </div>
                <span class="text-gray-600 dark:text-gray-300">${item.price.toLocaleString()} Silver each</span>
            </div>
        `;
        rewardsList.innerHTML += itemHTML;
    }
    totalSilverEl.textContent = `${summary.totalSilver.toLocaleString()}`;
}

function validateState() {
    const selectedUnits = container.querySelectorAll('.shrine-boss-unit.selected');
    const totalSelected = selectedUnits.length;
    let allTimesValid = true;

    const allUnits = container.querySelectorAll('.shrine-boss-unit');
    allUnits.forEach(unit => {
        const isDisabled = totalSelected >= 5 && !unit.classList.contains('selected');
        unit.classList.toggle('disabled', isDisabled);
    });

    if (totalSelected === 0) {
        allTimesValid = false;
    } else {
        selectedUnits.forEach(unit => {
            const timeInput = unit.querySelector('input[type="number"]');
            if (!timeInput.value || parseInt(timeInput.value) <= 0) {
                allTimesValid = false;
            }
        });
    }

    submitButton.disabled = !allTimesValid;
    updateSummary();
}

function renderBosses() {
    container.innerHTML = '';
    container.className = 'p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 justify-items-center overflow-y-auto';

    blackShrineBosses.forEach(boss => {
        const bossId = boss.name.replace(/\s+/g, '-');
        const hasModes = !!boss.rewards;
        
        const unitWrapper = document.createElement('div');
        unitWrapper.className = 'shrine-boss-unit';
        unitWrapper.dataset.bossName = boss.name;

        const tile = document.createElement('div');
        tile.className = 'shrine-boss-tile w-[320px] h-[80px] bg-cover bg-center rounded-lg shadow-md relative';
        if (boss.image) {
            tile.style.backgroundImage = `url('${boss.image}')`;
        } else {
            tile.classList.add('bg-gray-200', 'dark:bg-gray-700', 'flex', 'items-center', 'justify-center');
            tile.innerHTML = `<span class="text-2xl font-bold text-gray-800 dark:text-gray-100">${boss.name}</span>`;
        }
        tile.innerHTML += `
            <div class="time-input-container hidden absolute right-2 top-1/2 -translate-y-1/2">
                <input type="number" min="1" placeholder="Mins" class="w-20 text-center p-1 text-sm border rounded-md bg-white/80 dark:bg-gray-900/80 dark:border-gray-500">
            </div>
        `;

        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'shrine-options-panel bg-gray-200 dark:bg-gray-700 rounded-b-lg w-[320px] px-4';
        if(hasModes){
            optionsPanel.innerHTML = `
                <label for="mode-${bossId}" class="shrine-mode-toggle flex items-center justify-between cursor-pointer text-sm">
                    <span class="font-medium text-gray-600 dark:text-gray-300">Mode:</span>
                    <div class="flex items-center">
                        <span class="mr-2 font-medium text-green-500">Normal</span>
                        <div class="relative">
                            <input type="checkbox" id="mode-${bossId}" class="sr-only">
                            <div class="toggle-container w-10 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out bg-gray-400 dark:bg-gray-600">
                                <div class="toggle-circle bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out"></div>
                            </div>
                        </div>
                        <span class="ml-2 font-medium text-red-500">Hard</span>
                    </div>
                </label>
            `;
        }

        unitWrapper.appendChild(tile);
        unitWrapper.appendChild(optionsPanel);
        container.appendChild(unitWrapper);
    });
}

function collectData() {
    const selected = container.querySelectorAll('.shrine-boss-unit.selected');
    const runData = [];
    selected.forEach(unit => {
        const name = unit.dataset.bossName;
        const timeInput = unit.querySelector('input[type="number"]');
        const modeToggle = unit.querySelector('.shrine-mode-toggle input');
        
        const minutes = parseInt(timeInput.value) || 0;
        const mode = (modeToggle && modeToggle.checked) ? 'hard' : 'normal';

        runData.push({ name, minutes, mode });
    });
    return runData;
}

export function showBlackShrineModal() {
    renderBosses();
    validateState();
    modal.classList.remove('hidden');

    return new Promise(resolve => {
        resolvePromise = resolve;
    });
}

// Event Listeners
container.addEventListener('click', (e) => {
    const unit = e.target.closest('.shrine-boss-unit');
    const isModeToggle = e.target.closest('.shrine-mode-toggle');

    // If clicking the mode toggle, don't trigger the tile selection
    if (isModeToggle) {
        validateState(); // Still need to update summary if mode changes
        return;
    }
    
    if (unit && !unit.classList.contains('disabled')) {
        unit.classList.toggle('selected');
        const timeContainer = unit.querySelector('.time-input-container');
        timeContainer.classList.toggle('hidden', !unit.classList.contains('selected'));
        if(unit.classList.contains('selected')) {
            timeContainer.querySelector('input').focus();
        }
        validateState();
    }
});
container.addEventListener('input', validateState);

submitButton.addEventListener('click', () => {
    if (resolvePromise) resolvePromise(collectData());
    modal.classList.add('hidden');
});

cancelButton.addEventListener('click', () => {
    if (resolvePromise) resolvePromise(null);
    modal.classList.add('hidden');
});