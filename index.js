/**
 * 🧠 Smart Commute Planner — Multi-Agent Orchestrator
 * 
 * Asks for your city, then runs 3 agents in sequence:
 * 1. 🌦️ Weather Agent  — fetches 3-day forecast from wttr.in
 * 2. 🔍 Analysis Agent — Gemini decides car vs bike for each day
 * 3. 📧 Email Agent   — sends you a summary email
 */

import readlineSync from 'readline-sync';
import * as weatherAgent from './agents/weatherAgent.js';
import * as analysisAgent from './agents/analysisAgent.js';
import * as emailAgent from './agents/emailAgent.js';

console.log('');
console.log('╔══════════════════════════════════════════╗');
console.log('║   🤖 Smart Commute Planner (Multi-Agent) ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

// --- Step 1: Get user input ---
const city = readlineSync.question('📍 Enter your city: ');
const email = process.env.GMAIL_USER;

if (!city.trim()) {
    console.log('❌ City cannot be empty. Exiting.');
    process.exit(1);
}

console.log(`\n🚀 Starting multi-agent pipeline for "${city}"...`);
console.log(`📧 Summary will be sent to: ${email}\n`);

// --- Step 2: Run Weather Agent ---
const forecastData = await weatherAgent.run(city);
if (!forecastData) {
    console.log('❌ Weather Agent failed. Cannot proceed.');
    process.exit(1);
}

// --- Step 3: Run Analysis Agent ---
const decisions = await analysisAgent.run(forecastData);
if (!decisions) {
    console.log('❌ Analysis Agent failed. Cannot proceed.');
    process.exit(1);
}

// --- Step 4: Run Email Agent ---
await emailAgent.run(forecastData.location, forecastData.current, decisions, email);

// --- Final Summary ---
console.log('\n╔══════════════════════════════════════════╗');
console.log('║            ✅ ALL AGENTS DONE             ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

const carDays = decisions.filter(d => d.mode === 'car').length;
const bikeDays = decisions.filter(d => d.mode === 'bike').length;

console.log(`🤖: Your 3-day commute plan for ${forecastData.location} is ready!`);
console.log(`    🚗 Car days: ${carDays} | 🏍️ Bike days: ${bikeDays}`);
console.log(`    📧 Summary emailed to ${email}`);
console.log('');

for (const d of decisions) {
    console.log(`    ${d.date}  ${d.emoji}  ${d.mode.toUpperCase().padEnd(4)}  ${d.summary}`);
}
console.log('');