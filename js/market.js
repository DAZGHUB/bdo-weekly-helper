// js/market.js

const API_URL = 'https://api.arsha.io/v2/na/item?id=';
const CACHE_DURATION_MS = 3600 * 1000; // 1 hour
const ICON_URL = 'https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/';

const itemsToTrack = [
    { name: 'Memory Fragment', id: 44195, icon: `${ICON_URL}44195.png` },
    { name: 'Caphras Stone', id: 721003, icon: `${ICON_URL}721003.png` },
    { name: 'Black Stone (Weapon)', id: 16001, icon: `${ICON_URL}16001.png` }
];

function getApiUrl() {
    const region = localStorage.getItem('marketRegion') || 'na'; // Default to NA
    return `https://api.arsha.io/v2/${region}/item?id=`;
}

async function fetchItemPrice(itemId) {
    const region = localStorage.getItem('marketRegion') || 'na';
    const cacheKey = `price_${region}_${itemId}`; // Region-specific cache key
    const cachedItem = JSON.parse(localStorage.getItem(cacheKey));

    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION_MS)) {
        return cachedItem.price;
    }

    try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}${itemId}`);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        
        const data = await response.json();
        const priceData = Array.isArray(data) ? data[0] : data;

        if (!priceData || typeof priceData.basePrice === 'undefined') throw new Error('Invalid API response format');
        
        const price = priceData.basePrice;
        localStorage.setItem(cacheKey, JSON.stringify({ price: price, timestamp: Date.now() }));
        return price;
    } catch (error) {
        console.error(`Failed to fetch item price for ID ${itemId}:`, error);
        return cachedItem ? cachedItem.price : null;
    }
}

async function renderMarketData(contentElement) {
    contentElement.innerHTML = `<p>Loading prices...</p>`;

    let contentHTML = '';
    for (const item of itemsToTrack) {
        const price = await fetchItemPrice(item.id);
        const priceString = price ? price.toLocaleString() : 'Unavailable';

        contentHTML += `
            <div class="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <img src="${item.icon}" alt="${item.name}" class="w-10 h-10 mr-4">
                <div>
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-gray-500 dark:text-gray-400">${priceString} Silver</p>
                </div>
            </div>
        `;
    }
    contentElement.innerHTML = contentHTML;
}

export function initMarketPanel(panel, button, closeButton, content) {
    button.addEventListener('click', () => {
        panel.classList.add('open');
        renderMarketData(content);
    });

    closeButton.addEventListener('click', () => {
        panel.classList.remove('open');
    });
}

export function addMarketSettings(modalContent) {
    const currentRegion = localStorage.getItem('marketRegion') || 'na';
    const marketSection = document.createElement('div');
    marketSection.className = 'border-b pb-6 mb-6 dark:border-gray-600';
    marketSection.innerHTML = `
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Market Region</h3>
        <div class="flex space-x-8">
            <label class="flex items-center cursor-pointer">
                <input type="radio" name="marketRegion" value="na" class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" ${currentRegion === 'na' ? 'checked' : ''}>
                <span class="ml-2 text-gray-700 dark:text-gray-300">North America (NA)</span>
            </label>
            <label class="flex items-center cursor-pointer">
                <input type="radio" name="marketRegion" value="eu" class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" ${currentRegion === 'eu' ? 'checked' : ''}>
                <span class="ml-2 text-gray-700 dark:text-gray-300">Europe (EU)</span>
            </label>
        </div>
    `;
    modalContent.prepend(marketSection);
}