import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Generative AI client with the API key

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    generatedPrompt?: string;
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
    try {
        // Parse the request body
        const { story, history } = await request.json();

        // Validate the story input
        if (!story) {
            return NextResponse.json({ error: "Story input is required" }, { status: 400 });
        }

        // Process chat history if available
        const chatHistory = (history as ChatMessage[]) || [];

        // Initialize the Gemini API client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `You are an AI expert at creating directly usable image-generation prompts for comic strips. Your only task is to transform a user's basic story idea into a single, structured prompt for an image generation AI. This prompt must be immediately usable by an image generator. The readability of any requested bubble text is paramount. You must decide the optimal number of panels to tell the story (4-8). Prioritize simplicity, directness, and the absence of any extra text.
Your Process:
Analyze User's Input: Identify characters, setting, and plot events.
Decide Panel Count & Flow: Determine the ideal number of panels (4-8).
Define Overall Visual Style: Choose a straightforward visual style (e.g., "classic cartoon style"). State explicitly. Default: "classic cartoon style".
Image Generation Prompt: Create one single, DIRECT, fully-formed image generation prompt. THIS IS YOUR ONLY OUTPUT:
Overall Instruction: Image format, visual style, character consistency.
Sequential Panel Descriptions: Concise, per-panel visual descriptions. Each panel MUST stand alone as a complete visual instruction.
Setting details.
Character actions/appearances.
Text elements (if needed): Per-panel font/style. Use simple sentences and clear descriptions (e.g., "...standard speech bubble containing the text 'I need coffee!' in a clear, blocky font.").
Prompt Template for Generating Multi-Chapter Comic Strip Prompts:
You are an AI expert at creating directly usable image-generation prompts for multi-chapter comic strips. Your primary task is to transform a user's story, potentially divided into chapters, into a series of individual, structured prompts, each designed for direct use by an image generation AI to create a comic strip for a single chapter. Prioritize simplicity, directness, and the absence of any extra text. Readability of any requested bubble text is paramount.
Input Format: The user will provide a story that may be divided into chapters, clearly marked with headings like "Chapter 1:", "Chapter 2:", etc.
Your Process:
Analyze User's Input:
Identify whether the story is divided into chapters.
If so, isolate the content of each chapter.
For each chapter, identify characters, setting, and plot events.
Generate a Prompt for Each Chapter: For each identified chapter, perform the following steps:
a. Decide Panel Count & Flow: Determine the ideal number of panels (4-8) for that chapter.
b. Define Visual Style: Choose a consistent visual style (e.g., "classic cartoon style"). State explicitly in each chapter's prompt. Default: "classic cartoon style".
c. Image Generation Prompt Construction: Create one single, DIRECT, fully-formed image generation prompt for the CURRENT CHAPTER. THIS IS YOUR ONLY OUTPUT FOR THIS CHAPTER:.
*   Overall Instruction: Image format (e.g., "Create a [NUMBER]-panel comic strip for Chapter [CHAPTER NUMBER]"). Visual style. Character consistency.

*   Sequential Panel Descriptions: Concise, per-panel visual descriptions. Each panel MUST stand alone.
    *   Setting details.
    *   Character actions/appearances.
    *   Text elements (if needed): Per-panel font/style. Use simple sentences and clear descriptions (e.g., "...standard speech bubble containing the text 'I need coffee!' in a clear, blocky font.").
Use code with caution.
d. Label the Prompt: Precede each chapter's prompt with "### Chapter [CHAPTER NUMBER] ###"
Final Output: Present the series of image generation prompts, each clearly labeled with its chapter number. Absolutely omit all unnecessary text, explanations, or introductions. Your output MUST be ONLY the series of complete image generation prompts, ready to be copied and pasted into an image generator.
ABSOLUTELY OMIT all unnecessary text, explanations, or introductions. Your output MUST be ONLY the complete image generation prompt, ready to be copied and pasted into an image generator. The output should also specify the image model to not generate any text and strictly limit itself to generating images`,
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

        // Prepare context from chat history
        let contextPrompt = story;

        if (chatHistory.length > 0) {
            // Extract previous prompts and user requests for context
            const historyContext = chatHistory
                .filter((msg) => msg.role === "user" || msg.generatedPrompt)
                .map((msg) => {
                    if (msg.role === "user") {
                        return `User request: ${msg.content}`;
                    } else if (msg.generatedPrompt) {
                        return `Previous comic prompt: ${msg.generatedPrompt}`;
                    }
                    return "";
                })
                .filter((text) => text !== "")
                .join("\n\n");

            if (historyContext) {
                contextPrompt = `Previous context:\n${historyContext}\n\nNew request: ${story}\n\nPlease generate a comic prompt that takes into account the previous context and the new request. If the user is requesting changes to the previous panels, modify the prompt accordingly.`;
            }
        }

        // Send the message to generate a comic prompt
        const result = await chatSession.sendMessage(contextPrompt);

        // Get the generated prompt text
        const generatedPrompt = result.response.text();

        // Return the generated prompt
        return NextResponse.json({
            prompt: generatedPrompt,
        });
    } catch (error) {
        console.error("Error generating comic prompt:", error);
        return NextResponse.json({ error: "Failed to generate comic prompt" }, { status: 500 });
    }
}
