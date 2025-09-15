// js/blackShrineLogic.js
import { blackShrineBosses } from "./blackShrineData.js";
import { fetchItemPrice } from "./market.js";

export async function calculateBlackShrineSummary(runData) {
    let totalSilver = 0;
    let totalSeconds = 0;
    const rewardsBreakdown = {};
    const itemIdsToFetch = new Set();
    const allRewards = [];

    for (const bossRun of runData) {
        totalSeconds += bossRun.minutes * 60;
        const bossData = blackShrineBosses.find(b => b.name === bossRun.name);

        if (bossData) {
            if (bossData.rewards) {
                const rewardsForMode = bossData.rewards[bossRun.mode] || [];
                rewardsForMode.forEach(reward => allRewards.push(reward));
            } 
            else if (bossData.reward) {
                allRewards.push({ ...bossData.reward, type: 'market', name: bossData.name });
            }
        }
    }

    allRewards.forEach(reward => {
        const key = reward.itemId || reward.name;
        if (!rewardsBreakdown[key]) {
            rewardsBreakdown[key] = {
                name: reward.name,
                quantity: 0,
                price: reward.type === 'static' ? reward.value : 0,
                icon: reward.icon || `https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/${reward.itemId}.png`,
                type: reward.type
            };
        }
        rewardsBreakdown[key].quantity += reward.quantity;

        if (reward.type === 'market') {
            itemIdsToFetch.add(reward.itemId);
        }
    });

    const pricePromises = Array.from(itemIdsToFetch).map(id => fetchItemPrice(id));
    const prices = await Promise.all(pricePromises);
    const priceMap = new Map(Array.from(itemIdsToFetch).map((id, index) => [id, prices[index]]));

    for (const key in rewardsBreakdown) {
        const item = rewardsBreakdown[key];
        if (item.type === 'market') {
            const price = priceMap.get(parseInt(key)) || 0;
            item.price = price;
            totalSilver += price * item.quantity;
        } else {
            totalSilver += item.price * item.quantity;
        }
    }

    return { totalSilver, totalSeconds, rewardsBreakdown };
}

export async function calculateBlackShrineRun(runData) {
    const summary = await calculateBlackShrineSummary(runData);
    return { totalSilver: summary.totalSilver, totalSeconds: summary.totalSeconds };
}