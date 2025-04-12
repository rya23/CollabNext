import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Generative AI client
const apiKey = 'AIzaSyABHWecL1WasCQlnz6K7GJkqOBFW9Ac-PM';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Parse the request body
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI('AIzaSyABHWecL1WasCQlnz6K7GJkqOBFW9Ac-PM');
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
    });

    // Configure generation parameters
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseModalities: ["image", "text"],
      responseMimeType: "text/plain",
    };

    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the message to generate an image
    const result = await chatSession.sendMessage(prompt);
    
    // Process the response
    const candidates = result.response.candidates || [];
    const images = [];
    
    // Extract images from the response
    for (let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
      const candidate = candidates[candidate_index];
      if (candidate && candidate.content && candidate.content.parts) {
        for (let part_index = 0; part_index < candidate.content.parts.length; part_index++) {
          const part = candidate.content.parts[part_index];
          if (part.inlineData) {
            images.push({
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType,
            });
          }
        }
      }
    }

    // Return the generated images and text
    return NextResponse.json({
      images,
      text: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
