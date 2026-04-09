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


const user = "Hey, what is the weather of Hyderabad, telangana?";

// const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

model.generateContent(user)
    .then((result) => {
        const response = result.response;
        console.log("Response text:", response.text());
    })
    .catch((error) => console.error(error));