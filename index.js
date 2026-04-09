import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(geminiApiKey);

// Tools

const getWeatherDetails = (city = '') => {
    if (city.toLowerCase() === 'hyderabad') return '30°C';
    if (city.toLowerCase() === 'delhi') return '25°C';
    if (city.toLowerCase() === 'mumbai') return '28°C';
    return 'City not found';
}

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

const user = "Hey, what is the weather of Hyderabad, telangana?";

const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const chat = async () => {
    const result = await model.generateContent(SYSTEM_PROMPT + user)
    const response = result.response;
    // console.log(response)
    console.log(response.text());
}

chat();