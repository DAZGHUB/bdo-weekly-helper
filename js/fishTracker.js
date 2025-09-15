// js/fishTracker.js
import { showAlert, showConfirmation } from './modal.js';

const OCR_RECTANGLES = {
    '3440x1440': { top: 450, left: 1450, width: 550, height: 300 },
    '2560x1440': { top: 450, left: 1005, width: 550, height: 300 },
    '1920x1400': { top: 435, left: 685, width: 550, height: 300 },
    '1920x1200': { top: 335, left: 685, width: 550, height: 300 },
    '1920x1080': { top: 275, left: 685, width: 550, height: 300 }
};

let worker;
let recognizedSilver = 0;

let panel, pasteArea, preview, status, dataEntry, silverInput, hoursInput, saveButton, historyList, statsContainer, clearHistoryButton;

function getHistory() {
    return JSON.parse(localStorage.getItem('fishHistory')) || [];
}

function saveHistory(history) {
    localStorage.setItem('fishHistory', JSON.stringify(history));
    renderHistory();
}

function deleteHistoryEntry(timestamp) {
    let history = getHistory();
    history = history.filter(entry => entry.timestamp !== timestamp);
    saveHistory(history);
}

async function clearAllHistory() {
    const confirmed = await showConfirmation(
        'Clear History',
        'Are you sure you want to delete all fish sale history? This action cannot be undone.'
    );
    if (confirmed) {
        saveHistory([]);
    }
}

function renderFishStats() {
    const history = getHistory();
    const now = new Date();
    const msInDay = 86400000;

    const last14Days = history.filter(e => now - new Date(e.timestamp) < 14 * msInDay);
    const last30Days = history.filter(e => now - new Date(e.timestamp) < 30 * msInDay);

    const sumSilver = (arr) => arr.reduce((sum, entry) => sum + entry.silver, 0);

    const total14 = sumSilver(last14Days);
    const total30 = sumSilver(last30Days);
    const totalAll = sumSilver(history);

    statsContainer.innerHTML = `
        <div class="space-y-2 text-sm">
            <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Last 14 Days:</span>
                <span class="font-semibold">${total14.toLocaleString()} Silver</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Last 30 Days:</span>
                <span class="font-semibold">${total30.toLocaleString()} Silver</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">All Time:</span>
                <span class="font-semibold">${totalAll.toLocaleString()} Silver</span>
            </div>
        </div>
    `;
}

function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = '';
    
    clearHistoryButton.disabled = history.length === 0;

    if (history.length === 0) {
        historyList.innerHTML = `<p class="text-sm text-gray-500 text-center">No sales saved yet.</p>`;
    } else {
        history.sort((a, b) => b.timestamp - a.timestamp);

        history.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dateString = date.toLocaleDateString();
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const silverPerHour = entry.hours > 0 ? Math.round(entry.silver / entry.hours) : 0;
            const hoursText = entry.hours > 0 
                ? `${silverPerHour.toLocaleString()} Silver/hr (${entry.hours} hours)` 
                : '(no hours specified)';

            const entryDiv = document.createElement('div');
            entryDiv.className = 'p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm flex items-center justify-between';
            entryDiv.innerHTML = `
                <div>
                    <div class="flex font-semibold">
                        <span>${dateString} ${timeString}</span>
                        <span class="text-green-500 dark:text-gray-300 ml-4">${entry.silver.toLocaleString()} Silver</span>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${hoursText}</div>
                </div>
                <button class="delete-entry-btn" data-timestamp="${entry.timestamp}" title="Delete this entry">&times;</button>
            `;
            historyList.appendChild(entryDiv);
        });
    }
    renderFishStats();
}

function resetForm() {
    preview.src = '';
    preview.classList.add('hidden');
    dataEntry.classList.add('hidden');
    status.textContent = '';
    hoursInput.value = '';
    recognizedSilver = 0;
}

function findMatchingResolution(actualWidth, actualHeight) {
    const margin = 5;
    for (const key in OCR_RECTANGLES) {
        const [knownWidth, knownHeight] = key.split('x').map(Number);
        if (Math.abs(actualWidth - knownWidth) <= margin && Math.abs(actualHeight - knownHeight) <= margin) {
            return OCR_RECTANGLES[key];
        }
    }
    return null;
}

async function runOCR(image) {
    status.textContent = 'Initializing OCR engine...';
    if (!worker) {
        worker = await Tesseract.createWorker('eng');
    }
    
    const rectangle = findMatchingResolution(image.naturalWidth, image.naturalHeight);
    const options = rectangle ? { rectangle } : {};
    
    status.textContent = 'Recognizing text...';
    const { data: { text } } = await worker.recognize(image, options);
    
    const match = text.match(/Profit:\s*([\d,]+)/);
    if (match && match[1]) {
        recognizedSilver = parseInt(match[1].replace(/,/g, ''), 10);
        silverInput.value = recognizedSilver.toLocaleString();
        status.textContent = 'Recognition complete!';
        dataEntry.classList.remove('hidden');
        hoursInput.focus();
    } else {
        status.textContent = 'Error: Could not find profit number.';
        showAlert('OCR Error', 'Could not find a profit number in the image. Please try a clearer screenshot.');
        setTimeout(resetForm, 3000);
    }
}

function processImageFile(imageFile) {
    if (imageFile && imageFile.type.startsWith('image/')) {
        resetForm();
        preview.classList.remove('hidden');
        const url = URL.createObjectURL(imageFile);
        preview.src = url;
        preview.onload = () => {
            runOCR(preview);
        };
    } else {
        showAlert('Invalid File', 'Please paste or drop an image file.');
    }
}

export function initFishTracker(panelEl, buttonEl, closeButtonEl, pasteAreaEl, previewEl, statusEl, dataEntryEl, silverInputEl, hoursInputEl, saveButtonEl, historyListEl, statsContainerEl, clearHistoryButtonEl) {
    panel = panelEl;
    pasteArea = pasteAreaEl;
    preview = previewEl;
    status = statusEl;
    dataEntry = dataEntryEl;
    silverInput = silverInputEl;
    hoursInput = hoursInputEl;
    saveButton = saveButtonEl;
    historyList = historyListEl;
    statsContainer = statsContainerEl;
    clearHistoryButton = clearHistoryButtonEl;

    buttonEl.addEventListener('click', () => {
        panel.classList.add('open');
        renderHistory();
    });

    closeButtonEl.addEventListener('click', () => panel.classList.remove('open'));
    clearHistoryButton.addEventListener('click', clearAllHistory);

    pasteArea.addEventListener('click', () => {
        navigator.clipboard.read().then(items => {
            const imageItem = items.find(item => item.types.some(type => type.startsWith('image/')));
            if (imageItem) {
                imageItem.getType(imageItem.types[0]).then(processImageFile);
            } else {
                showAlert('Clipboard Error', 'No image found on your clipboard. Please copy a screenshot first.');
            }
        }).catch(err => showAlert('Clipboard Error', 'Could not read from clipboard. Please try pasting with Ctrl+V instead.'));
    });
    
    pasteArea.addEventListener('paste', event => processImageFile(event.clipboardData.files[0]));
    
    pasteArea.addEventListener('dragover', e => { e.preventDefault(); pasteArea.classList.add('border-gray-500'); });
    pasteArea.addEventListener('dragleave', () => pasteArea.classList.remove('border-gray-500'));
    pasteArea.addEventListener('drop', e => { e.preventDefault(); pasteArea.classList.remove('border-gray-500'); processImageFile(e.dataTransfer.files[0]); });

    saveButton.addEventListener('click', () => {
        if (recognizedSilver > 0) {
            const history = getHistory();
            history.push({
                timestamp: Date.now(),
                silver: recognizedSilver,
                hours: parseFloat(hoursInput.value) || 0
            });
            saveHistory(history);
            resetForm();
        }
    });

    historyList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-entry-btn')) {
            const timestamp = parseInt(e.target.dataset.timestamp, 10);
            deleteHistoryEntry(timestamp);
        }
    });

    renderHistory();
}