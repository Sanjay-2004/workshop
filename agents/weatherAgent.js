/**
 * 🌦️ Weather Agent — Fetches and formats forecast data from wttr.in
 */

import { getForecast } from '../tools/forecast.js';

export async function run(city) {
    console.log(`\n---------🌦️ WEATHER AGENT-------`);
    console.log(`Fetching 3-day forecast for ${city}...`);

    const data = await getForecast(city);

    if (!data) {
        console.log(`❌ Failed to fetch weather for ${city}`);
        console.log(`---------------------`);
        return null;
    }

    console.log(`📍 Location: ${data.location}`);
    console.log(`🌡️  Current: ${data.current.tempC}°C, ${data.current.description}`);
    console.log(`📅 Forecast:`);
    for (const day of data.forecast) {
        console.log(`   ${day.date}: ${day.minTempC}–${day.maxTempC}°C, Rain ${day.chanceOfRain}%, ${day.description}`);
    }
    console.log(`✅ Forecast ready`);
    console.log(`---------------------`);

    return data;
}
