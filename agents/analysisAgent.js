/**
 * 🔍 Analysis Agent — Uses Gemini to classify weather days and assign commute mode
 * This is the only agent that actually uses LLM reasoning.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction: `You are a commute planning analyst. Given weather forecast data, you must classify each day and recommend a commute mode.

Rules (check in this order, first match wins):
- If rain chance > 40% → mode: "car", reason: "Rain expected (X% chance)"
- If max temperature < 39°C → mode: "bike", reason: "Normal heat (X°C)"
- If max temperature >= 39°C → mode: "car", reason: "Extreme heat (X°C)"
- If max temperature >= 32°C AND humidity > 55% → mode: "car", reason: "Hot & humid (X°C, Y% humidity)"
- If wind speed > 35 kmph → mode: "car", reason: "High winds (X kmph)"
- If max temperature <= 10°C → mode: "car", reason: "Too cold (X°C)"
- Otherwise → mode: "bike", reason: "Pleasant weather"

Fill in actual values for X and Y in the reason.

You MUST respond with a JSON array. Each element must have:
- date (string, YYYY-MM-DD)
- mode ("car" or "bike")
- emoji ("🚗" for car, "🏍️" for bike)
- reason (string explaining why, with actual values)
- summary (one-line weather summary for that day)

Example output:
[
  {"date":"2026-04-10","mode":"bike","emoji":"🏍️","reason":"Pleasant weather","summary":"28°C, Clear, Rain 10%, Humidity 45%"},
  {"date":"2026-04-11","mode":"car","emoji":"🚗","reason":"Extreme heat (38°C)","summary":"38°C, Sunny, Rain 0%, Humidity 30%"}
]

ONLY output the JSON array. No other text.`
});

export async function run(forecastData) {
    console.log(`\n---------🔍 ANALYSIS AGENT-------`);
    console.log(`Analyzing forecast with Gemini...`);

    const prompt = `Analyze this forecast and classify each day:\n${JSON.stringify(forecastData.forecast, null, 2)}\n\nLocation: ${forecastData.location}`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
        });

        const text = result.response.text();
        const decisions = JSON.parse(text);

        for (const d of decisions) {
            console.log(`   ${d.date}: ${d.emoji} ${d.mode.toUpperCase()} — ${d.reason} (${d.summary})`);
        }
        console.log(`✅ Analysis complete`);
        console.log(`---------------------`);

        return decisions;
    } catch (error) {
        console.error(`❌ Analysis failed:`, error.message);
        console.log(`---------------------`);
        return null;
    }
}
