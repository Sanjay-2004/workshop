/**
 * Calendar Tool — Creates events on Google Calendar via OAuth2
 */

import { google } from 'googleapis';

function getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/oauth2callback'
    );
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oauth2Client;
}

/**
 * Create a full-day calendar event
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} title - Event title (e.g. "🚗 Take Car — Rain Expected")
 * @param {string} description - Event description with weather details
 */
export async function createCalendarEvent(date, title, description) {
    try {
        const auth = getOAuth2Client();
        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: title,
            description: description,
            start: {
                date: date, // All-day event
                timeZone: 'Asia/Kolkata',
            },
            end: {
                date: date,
                timeZone: 'Asia/Kolkata',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 60 * 12 }, // Remind evening before
                ],
            },
        };

        const res = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            resource: event,
        });

        return { success: true, eventId: res.data.id, link: res.data.htmlLink };
    } catch (error) {
        console.error(`❌ Calendar error for ${date}:`, error.message);
        return { success: false, error: error.message };
    }
}
