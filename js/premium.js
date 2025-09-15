import { sha256 } from './sha256.js';

const PREMIUM_KEY = 'isPremiumUser';
const CORRECT_HASH = '038eb1a629304bd1e947bc5ae6e12eaa7da7287b36a0b3557ce8274bff840495';

export const isPremium = () => localStorage.getItem(PREMIUM_KEY) === 'true';

export const setPremium = () => {
    localStorage.setItem(PREMIUM_KEY, 'true');
    updatePremiumUI();
};

const updatePremiumUI = () => {
    const body = document.body;
    const premiumBadge = document.getElementById('premiumBadge');
    if (isPremium()) {
        body.classList.add('is-premium');
        if (premiumBadge) premiumBadge.textContent = 'PREMIUM USER';
    } else {
        body.classList.remove('is-premium');
        if (premiumBadge) premiumBadge.textContent = 'NON-PREMIUM';
    }
};

export const checkCode = (inputCode) => {
    if (!inputCode) return false;
    const inputHash = sha256(inputCode);
    if (inputHash === CORRECT_HASH) {
        setPremium();
        return true;
    }
    return false;
};

export const initPremiumFeatures = () => {
    updatePremiumUI();
};