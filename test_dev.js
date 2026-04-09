import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const key = env.split('=')[1].trim();
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });

async function run() {
  try {
    const contents = [
      { role: 'user', parts: [{ text: 'Hello' }] },
      { role: 'model', parts: [{ text: 'Hi' }] },
      { role: 'developer', parts: [{ text: 'Observation: 30C' }] }
    ];
    await model.generateContent({ contents });
    console.log("Success with developer role");
  } catch(e) {
    console.error(e);
  }
}
run();
