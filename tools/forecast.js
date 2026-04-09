/**
 * Forecast Tool — Fetches 3-day weather forecast from wttr.in
 */

export async function getForecast(city) {
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (!res.ok) throw new Error(`wttr.in returned ${res.status}`);
        const data = await res.json();

        const forecast = data.weather.map(day => {
            // Use midday (index 4 = 12:00) for representative weather
            const midday = day.hourly[4];
            return {
                date: day.date,
                maxTempC: parseInt(day.maxtempC),
                minTempC: parseInt(day.mintempC),
                avgTempC: Math.round((parseInt(day.maxtempC) + parseInt(day.mintempC)) / 2),
                chanceOfRain: parseInt(midday.chanceofrain),
                humidity: parseInt(midday.humidity),
                description: midday.weatherDesc[0].value,
                windSpeedKmph: parseInt(midday.windspeedKmph),
            };
        });

        const currentCondition = data.current_condition[0];
        const current = {
            tempC: parseInt(currentCondition.temp_C),
            feelsLikeC: parseInt(currentCondition.FeelsLikeC),
            humidity: parseInt(currentCondition.humidity),
            description: currentCondition.weatherDesc[0].value,
        };

        const area = data.nearest_area[0];
        const location = `${area.areaName[0].value}, ${area.region[0].value}, ${area.country[0].value}`;

        return { location, current, forecast };
    } catch (error) {
        console.error(`❌ Error fetching forecast for "${city}":`, error.message);
        return null;
    }
}
