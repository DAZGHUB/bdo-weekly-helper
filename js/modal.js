// js/modal.js

// --- DOM ELEMENT REFERENCES ---
// Declare variables here, but assign them after the DOM is ready.
let confirmationModalElement, confirmationTitle, confirmationMessage, confirmationButtons;
let timeInputModalElement, timeMinutesInput, timeSecondsInput, timeModalButtons;

let resolvePromise;

/**
 * This function must be called once the DOM is loaded to get the elements.
 */
export function initModalElements() {
    confirmationModalElement = document.getElementById('confirmationModal');
    confirmationTitle = document.getElementById('modalTitle');
    confirmationMessage = document.getElementById('modalMessage');
    confirmationButtons = document.getElementById('modalButtons');

    timeInputModalElement = document.getElementById('timeInputModal');
    timeMinutesInput = document.getElementById('timeMinutes');
    timeSecondsInput = document.getElementById('timeSeconds');
    timeModalButtons = document.getElementById('timeModalButtons');
}

function showGenericModal(modalEl, titleEl, title, msgEl, message, buttonsEl, buttons) {
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    buttonsEl.innerHTML = ''; // Clear any previous buttons

    buttons.forEach(btnConfig => {
        const button = document.createElement('button');
        button.textContent = btnConfig.text;
        button.className = btnConfig.classes;
        button.onclick = (e) => {
            e.preventDefault(); // Prevent form submission if any
            modalEl.classList.add('hidden');
            if (resolvePromise) {
                const resolution = typeof btnConfig.resolves === 'function' ? btnConfig.resolves() : btnConfig.resolves;
                resolvePromise(resolution);
            }
        };
        buttonsEl.appendChild(button);
    });

    modalEl.classList.remove('hidden');
}

export function showConfirmation(title, message) {
    const buttonClasses = 'font-bold py-2 px-4 rounded-lg transition-colors';
    return new Promise((resolve) => {
        resolvePromise = resolve;
        showGenericModal(confirmationModalElement, confirmationTitle, title, confirmationMessage, message, confirmationButtons, [
            { text: 'Cancel', classes: `${buttonClasses} bg-gray-300 hover:bg-gray-400 text-black`, resolves: false },
            { text: 'Confirm', classes: `${buttonClasses} bg-red-600 hover:bg-red-700 text-white`, resolves: true }
        ]);
    });
}

export function showAlert(title, message) {
    const buttonClasses = 'font-bold py-2 px-4 rounded-lg transition-colors';
    return new Promise((resolve) => {
        resolvePromise = resolve;
        showGenericModal(confirmationModalElement, confirmationTitle, title, confirmationMessage, message, confirmationButtons, [
             { text: 'OK', classes: `${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white`, resolves: true }
        ]);
    });
}

export function showTimeInputModal() {
    const buttonClasses = 'font-bold py-2 px-4 rounded-lg transition-colors';
    timeMinutesInput.value = '';
    timeSecondsInput.value = '';

    return new Promise((resolve) => {
        resolvePromise = resolve;
        showGenericModal(timeInputModalElement, null, '', null, '', timeModalButtons, [
            { text: 'Cancel', classes: `${buttonClasses} bg-gray-300 hover:bg-gray-400 text-black`, resolves: null },
            { 
                text: 'Submit', 
                classes: `${buttonClasses} bg-green-600 hover:bg-green-700 text-white`, 
                resolves: () => {
                    const minutes = parseInt(timeMinutesInput.value) || 0;
                    const seconds = parseInt(timeSecondsInput.value) || 0;
                    return (minutes * 60) + seconds;
                }
            }
        ]);
        timeMinutesInput.focus();
    });
}