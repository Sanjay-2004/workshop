import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const key = env.split('=')[1].trim();

const genAI = new GoogleGenerativeAI(key);
const models = ["gemini-2.5-flash"];
const user = "Hey, what is the weather of Hyderabad, telangana?";

async function run() {
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent(user);
      console.log(`\n--- ${m} ---`);
      console.log(result.response.text());
    } catch(e) {
        console.error(e);
    }
  }
}
run();
