import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const key = env.split('=')[1].trim();

const genAI = new GoogleGenerativeAI(key);
async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name));
  } catch(e) {
    console.error(e);
  }
}
run();
