/**
 * 📅 Calendar Agent — Creates Google Calendar events for each commute decision
 */

import { createCalendarEvent } from '../tools/calendar.js';

export async function run(decisions, location) {
    console.log(`\n---------📅 CALENDAR AGENT-------`);
    console.log(`Creating calendar events for ${location}...`);

    const results = [];

    for (const d of decisions) {
        const title = d.mode === 'car'
            ? `🚗 Take Car — ${d.reason}`
            : `🏍️ Bike Day — ${d.reason}`;

        const description = `Smart Commute Planner\n📍 ${location}\n🌤️ ${d.summary}\n\nRecommendation: ${d.emoji} ${d.mode.toUpperCase()}\nReason: ${d.reason}`;

        const result = await createCalendarEvent(d.date, title, description);

        if (result.success) {
            console.log(`   ✅ ${d.date} — ${title}`);
        } else {
            console.log(`   ❌ ${d.date} — Failed: ${result.error}`);
        }

        results.push({ ...d, eventResult: result });
    }

    console.log(`✅ Calendar events processed`);
    console.log(`---------------------`);

    return results;
}
