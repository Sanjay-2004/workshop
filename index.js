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
Start
{"type":"user", "user": "What is the sum of weather of hyderabad and delhi?"},
{"type":"plan", "plan": "call getWeatherDetails for hyderabad"},
{"type":"action", "function": "getWeatherDetails", "arguments": {"city": "hyderabad"}},
{"type":"observe", "observation": "30°C"},
{"type":"plan", "plan": "call getWeatherDetails for delhi"},
{"type":"action", "function": "getWeatherDetails", "arguments": {"city": "delhi"}},
{"type":"observe", "observation": "25°C"},
{"type":"output", "output": "The sum is 55°C"}


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

const getWeatherDetails = (city = '') => {
    if (city.toLowerCase() === 'hyderabad') return '38°C';
    if (city.toLowerCase() === 'delhi') return '25°C';
    if (city.toLowerCase() === 'mumbai') return '28°C';
    return 'City not found';
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
            console.log("Assistant: ", json.output);
            messages.push({
                role: "model",
                parts: [{ text: text }]
            });
            break;
        }
        else if (json.type === "plan") {
            console.log("Plan: ", json.plan);

            // Push the plan as model response
            messages.push({ role: "model", parts: [{ text: text }] });
            // Push a dummy user response so Gemini knows to continue
            messages.push({ role: "user", parts: [{ text: '{"type":"system","message":"proceed"}' }] });
        }
        else if (json.type === "action") {
            console.log("Action: ", json.function, json.arguments);

            // Execute the local function!
            let observeResult;
            if (json.function === 'getWeatherDetails') {
                observeResult = getWeatherDetails(json.arguments.city);
            } else {
                observeResult = "Function unrecognized";
            }

            // Push the model's action into history
            messages.push({ role: "model", parts: [{ text: text }] });

            const observationJson = JSON.stringify({ type: "observe", observation: observeResult });
            console.log("Observation: ", observeResult);

            // Push the observation back to the model as the user
            messages.push({ role: "user", parts: [{ text: observationJson }] });
        }
        else if (json.type === "observe") {
            console.log("Observation state triggered externally");
            break;
        }
    }
}