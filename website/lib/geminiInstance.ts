import { GoogleGenerativeAI } from '@google/generative-ai';
import { initGemini } from './gemini';

//console.log('process.env.NEXT_PUBLIC_GEMINI_API_KEY', process.env.NEXT_PUBLIC_GEMINI_API_KEY);

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
}

export const genAI = initGemini(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
