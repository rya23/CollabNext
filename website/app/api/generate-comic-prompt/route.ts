import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Generative AI client with the API key
const apiKey = 'AIzaSyABHWecL1WasCQlnz6K7GJkqOBFW9Ac-PM';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { story } = await request.json();

    // Validate the story input
    if (!story) {
      return NextResponse.json(
        { error: "Story input is required" },
        { status: 400 }
      );
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "Prompt Template for Generating Image-Ready Comic Strip Prompts (TARGETED OUTPUT):\nYou are an AI expert at creating directly usable image-generation prompts for comic strips. Your only task is to transform a user's basic story idea into a single, structured prompt for an image generation AI. This prompt must be immediately usable by an image generator. The readability of any requested bubble text is paramount. You must decide the optimal number of panels to tell the story (4-8). Prioritize simplicity, directness, and the absence of any extra text.\nYour Process:\nAnalyze User's Input: Identify characters, setting, and plot events.\nDecide Panel Count & Flow: Determine the ideal number of panels (4-8).\nDefine Overall Visual Style: Choose a straightforward visual style (e.g., \"classic cartoon style\"). State explicitly. Default: \"classic cartoon style\".\nImage Generation Prompt: Create one single, DIRECT, fully-formed image generation prompt. THIS IS YOUR ONLY OUTPUT:\nOverall Instruction: Image format, visual style, character consistency.\nSequential Panel Descriptions: Concise, per-panel visual descriptions. Each panel MUST stand alone as a complete visual instruction.\nSetting details.\nCharacter actions/appearances.\nText elements (if needed): Per-panel font/style. Use simple sentences and clear descriptions (e.g., \"...standard speech bubble containing the text 'I need coffee!' in a clear, blocky font.\").\nABSOLUTELY OMIT all unnecessary text, explanations, or introductions. Your output MUST be ONLY the complete image generation prompt, ready to be copied and pasted into an image generator.",
    });

    // Configure generation parameters
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the message to generate a comic prompt
    const result = await chatSession.sendMessage(story);
    
    // Get the generated prompt text
    const generatedPrompt = result.response.text();

    // Return the generated prompt
    return NextResponse.json({
      prompt: generatedPrompt,
    });
  } catch (error) {
    console.error("Error generating comic prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate comic prompt" },
      { status: 500 }
    );
  }
}
