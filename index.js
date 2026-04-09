import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from "readline-sync";

const geminiApiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(geminiApiKey);

const SYSTEM_PROMPT = `
You are a helpful assistant that provides weather information for cities around the world.
You have these states: start, plan, action, observe and output.
Wait for user prompt and first plan using the available tools
After that is done, take action with appropriate tools and wait for observation based on the action.
Once the observation is received, return the response based on start prompt and observation

Available Tools:
- getWeatherDetails(city: string): string
This function is used to get the weather details of a city.

Example:
User: {"type":"user", "user": "What is the sum of weather of hyderabad and delhi?"}
Assistant: {"type":"plan", "plan": "call getWeatherDetails for hyderabad"}
User: {"type":"system","message":"proceed"}
Assistant: {"type":"action", "function": "getWeatherDetails", "arguments": {"city": "hyderabad"}}
User: {"type":"observe", "observation": "30°C"}
Assistant: {"type":"plan", "plan": "call getWeatherDetails for delhi"}
User: {"type":"system","message":"proceed"}
Assistant: {"type":"action", "function": "getWeatherDetails", "arguments": {"city": "delhi"}}
User: {"type":"observe", "observation": "25°C"}
Assistant: {"type":"output", "output": "The sum is 55°C"}

CRITICAL INSTRUCTION: You must strictly output ONLY ONE JSON object per response. Do not output multiple JSON objects separated by commas.
`


// const model = genAI.getGenerativeModel({ 
//     model: "gemma-3-4b-it",
//     systemInstruction: SYSTEM_PROMPT 
// });
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: SYSTEM_PROMPT
});

// Tools

const getWeatherDetails = async (city = '') => {
    try {
        const response = await fetch(`https://wttr.in/${city}?format=3`);
        const weather = await response.text();
        return weather.trim();
    } catch (error) {
        return 'Error fetching weather';
    }
}

const messages = [];

while (true) {
    const query = readlineSync.question("You: ");
    const q = {
        role: "user",
        parts: [{ text: query }]
    }
    messages.push(q);

    while (true) {
        // Fix: responseMimeType must be inside generationConfig
        const chat = await model.generateContent({
            contents: messages,
            generationConfig: { responseMimeType: "application/json" }
        });
        const response = chat.response;
        const text = response.text();

        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            console.log("JSON parse error", text);
            break;
        }

        if (json.type === "output") {
            console.log(`---------AI-------\nOutput: ${json.output}\n---------------------`);
            console.log(`🤖: ${json.output}`);
            messages.push({
                role: "model",
                parts: [{ text: text }]
            });
            break;
        }
        else if (json.type === "plan") {
            console.log(`---------AI-------\nPlan: ${json.plan}\n---------------------`);

            // Push the plan as model response
            messages.push({ role: "model", parts: [{ text: text }] });
            // Push a dummy user response so Gemini knows to continue
            messages.push({ role: "user", parts: [{ text: '{"type":"system","message":"proceed"}' }] });
        }
        else if (json.type === "action") {
            console.log(`---------AI-------\nAction: ${json.function} ${JSON.stringify(json.arguments)}\n---------------------`);

            // Execute the local function!
            let observeResult;
            if (json.function === 'getWeatherDetails') {
                observeResult = await getWeatherDetails(json.arguments.city);
            } else {
                observeResult = "Function unrecognized";
            }

            // Push the model's action into history
            messages.push({ role: "model", parts: [{ text: text }] });

            const observationJson = JSON.stringify({ type: "observe", observation: observeResult });
            console.log(`Observation: ${observeResult}`);

            // Push the observation back to the model as the user
            messages.push({ role: "user", parts: [{ text: observationJson }] });
        }
        else if (json.type === "observe") {
            console.log("Observation state triggered externally");
            break;
        }
    }
}