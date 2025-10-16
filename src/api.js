// src/api.js

const PROXIES = [
    'https://cors.eu.org/',
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
];

// This helper function tries different CORS proxies if one fails.
async function fetchWithProxyRotation(apiUrl) {
    for (const proxyUrl of PROXIES) {
        const fullUrl = proxyUrl.includes('?') ? `${proxyUrl}${encodeURIComponent(apiUrl)}` : `${proxyUrl}${apiUrl}`;
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`Proxy failed: ${proxyUrl}`);
            const text = await response.text();
            const jsonData = text.includes('"contents":') ? JSON.parse(text).contents : text;
            return JSON.parse(jsonData);
        } catch (error) {
            console.warn(`Proxy ${proxyUrl} failed. Trying next...`);
        }
    }
    console.error(`All proxies failed for API URL: ${apiUrl}`);
    return null;
}

// Main function to fetch and process all data for a new fighter.
// It no longer interacts with the DOM; it just returns data.
export async function fetchSteamData(appId) {
    if (!appId || !/^\d+$/.test(appId)) {
        console.error('Invalid App ID provided.');
        return null;
    }

    const reviewsUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=english`;
    const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;

    const [reviewsData, detailsData] = await Promise.all([
        fetchWithProxyRotation(reviewsUrl),
        fetchWithProxyRotation(detailsUrl)
    ]);

    if (reviewsData?.success && detailsData?.[appId]?.success) {
        const appDetails = detailsData[appId].data;
        
        // Create a new fighter object from the fetched data.
        const newFighter = {
            name: appDetails?.name || `Game ${appId}`,
            devHouse: appDetails?.developers?.[0] || '',
            publisher: appDetails?.publishers?.[0] || '',
            record: { tko: 0, ko: 0, losses: 0, pastTitles: {} },
            scores: { metacritic: appDetails?.metacritic?.score?.toString() || '404' },
            steamData: reviewsData.query_summary,
            genres: appDetails?.genres?.map(g => g.description.toLowerCase()) || [],
            appId: appId,
            isHallOfFamer: false,
            isRetired: false,
            lastModified: new Date().toISOString()
        };
        return newFighter;
    } else {
        console.error('Failed to fetch data from Steam servers.');
        return null;
    }
}
