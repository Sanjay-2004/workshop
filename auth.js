/**
 * One-time OAuth2 setup script for Google Calendar access.
 * 
 * Prerequisites:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a project (or use existing)
 * 3. Enable "Google Calendar API"
 * 4. Go to Credentials → Create Credentials → OAuth Client ID
 * 5. Application type: "Web application"
 * 6. Add http://localhost:3000/oauth2callback as an Authorized redirect URI
 * 7. Copy Client ID and Client Secret into .env.local
 * 
 * Then run: bun run auth.js
 * It will open your browser, you sign in, and it prints your refresh token.
 * Paste the refresh token into .env.local as GOOGLE_REFRESH_TOKEN.
 */

import { google } from 'googleapis';
import http from 'http';
import open from 'open';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force to get refresh_token
    login_hint: process.env.GMAIL_USER, // Pre-select the correct Google account
});

console.log('\n🔐 Google Calendar OAuth2 Setup\n');
console.log('If the browser opens with the wrong account, copy this URL');
console.log('and open it in an incognito window or the correct browser profile:\n');
console.log(authUrl);
console.log('\nOpening browser...\n');

// Create a temporary server to catch the callback
const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/oauth2callback')) {
        const url = new URL(req.url, 'http://localhost:3000');
        const code = url.searchParams.get('code');

        if (code) {
            try {
                const { tokens } = await oauth2Client.getToken(code);

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                    <body style="font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0;">
                        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h1>✅ Authorization Successful!</h1>
                            <p>You can close this tab and go back to the terminal.</p>
                        </div>
                    </body>
                    </html>
                `);

                console.log('✅ Authorization successful!\n');
                console.log('Add this to your .env.local:\n');
                console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

                server.close();
                process.exit(0);
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error exchanging code for tokens');
                console.error('❌ Error:', error.message);
                server.close();
                process.exit(1);
            }
        }
    }
});

server.listen(3000, () => {
    console.log('Waiting for authorization callback on http://localhost:3000...\n');
    open(authUrl);
});
