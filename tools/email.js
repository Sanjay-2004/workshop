/**
 * Email Tool — Sends summary email via Nodemailer + Gmail
 */

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Send an HTML email summary
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
export async function sendEmail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: `"🤖 Smart Commute Planner" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
    }
}
