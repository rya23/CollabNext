import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { genAI } from './geminiInstance';

// Initialize the Gemini API
export const initGemini = (apiKey: string) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
};

// Chat model for conversations
export const getGeminiModel = (genAI: GoogleGenerativeAI) => {
    return genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ],
    });
};

// Structured output types
export interface SummarizeResponse {
    summary: string;
}

export interface GrammarCorrectionResponse {
    corrected: string;
    changes: Array<{
        original: string;
        correction: string;
        explanation: string;
    }>;
}

export interface TranslateResponse {
    translated: string;
    language: string;
}

export interface SimplifyResponse {
    simplified: string;
}

export type ElaborateResponse = {
    elaborated: string;
};

export interface FileGenerationResponse {
    content: string;
    explanation: string;
    fileType?: string;
    suggestedFileName?: string;
}

export interface StyleTransformResponse {
    transformed: string;
    style: string;
}

// Add this new interface for chat history
export interface ChatHistory {
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

// Functions to generate structured output
export const summarizeText = async (genAI: GoogleGenerativeAI, text: string): Promise<SummarizeResponse> => {
    const model = getGeminiModel(genAI);

    const prompt = `
    Summarize the following text concisely:
    
    "${text}"
    
    Provide a structured JSON response with the following format:
    {
      "summary": "your summary here"
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    try {
        // Extract JSON from the response if needed
        const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/{[\s\S]*}/);

        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        return JSON.parse(jsonStr) as SummarizeResponse;
    } catch (e) {
        // Fallback if JSON parsing fails
        return { summary: responseText.replace(/```json|```/g, '').trim() };
    }
};

export const correctGrammar = async (genAI: GoogleGenerativeAI, text: string): Promise<GrammarCorrectionResponse> => {
    const model = getGeminiModel(genAI);

    const prompt = `
    Correct grammar and spelling in the following text:
    
    "${text}"
    
    Provide a structured JSON response with the following format:
    {
      "corrected": "corrected text",
      "changes": [
        {
          "original": "original text with error",
          "correction": "corrected text",
          "explanation": "brief explanation of correction"
        }
      ]
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    try {
        const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/{[\s\S]*}/);

        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        return JSON.parse(jsonStr) as GrammarCorrectionResponse;
    } catch (e) {
        // Fallback if JSON parsing fails
        return {
            corrected: text,
            changes: [],
        };
    }
};

export const translateText = async (
    genAI: GoogleGenerativeAI,
    text: string,
    targetLanguage: string
): Promise<TranslateResponse> => {
    const model = getGeminiModel(genAI);

    const prompt = `
    Translate the following text to ${targetLanguage}:
    
    "${text}"
    
    Provide a structured JSON response with the following format:
    {
      "translated": "translated text",
      "language": "${targetLanguage}"
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    try {
        const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/{[\s\S]*}/);

        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        return JSON.parse(jsonStr) as TranslateResponse;
    } catch (e) {
        // Fallback if JSON parsing fails
        return {
            translated: responseText.replace(/```json|```/g, '').trim(),
            language: targetLanguage,
        };
    }
};

export const simplifyText = async (genAI: GoogleGenerativeAI, text: string): Promise<SimplifyResponse> => {
    const model = getGeminiModel(genAI);

    const prompt = `
    Simplify the following text, making it easier to understand while preserving key information:
    
    "${text}"
    
    Provide a structured JSON response with the following format:
    {
      "simplified": "simplified text"
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    try {
        const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/{[\s\S]*}/);

        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        return JSON.parse(jsonStr) as SimplifyResponse;
    } catch (e) {
        // Fallback if JSON parsing fails
        return {
            simplified: responseText.replace(/```json|```/g, '').trim(),
        };
    }
};

export async function elaborateText(genAI: any, text: string): Promise<ElaborateResponse> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        systemInstruction:
            'You are an AI specializing in generating well-structured written content, including essays, emails, reports, and similar text-based documents. You must only generate text in these formats and avoid any responses unrelated to writing. Do not generate images, code, or non-textual content. Ensure clarity, coherence, and proper formatting in all responses.',
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ],
    });

    const prompt = `
      Please elaborate on the following text by adding details, examples, and explanations while maintaining the original meaning.
      Analyze the text and expand it into the most appropriate form (e.g., letter, essay, or email).
      
      Text: "${text}"
      
      Ensure the response follows a structured format.
    `;

    const result = await model.generateContent(prompt, generationConfig);
    const response = await result.response;
    ``;
    const elaborated = response.text(); // Ensure correct response extraction

    return { elaborated };
}

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
    responseSchema: {
        type: 'object',
        properties: {
            elaborated: {
                type: 'string',
            },
        },
    },
};

export const getGeminiSuggestion = async (text: any, callback: (text: string) => void) => {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            systemInstruction: `You are an intelligent text autocomplete assistant. 
      Your goal is to:
      - Continue text naturally and contextually
      - Provide concise, relevant completions
      - Match the tone and style of the input text
      - Avoid repeating the input text
      - Generate a completion that sounds human-like
      - Keep the suggestion between 10-30 words
      - Do not start with filler words or phrases
      
      Respond only with the text continuation.`,
            generationConfig: {
                maxOutputTokens: 50,
                temperature: 0.7,
                topP: 0.9,
            },
        });

        const result = await model.generateContentStream(text);
        for await (const chunk of result.stream) {
            callback(chunk.text()); // Update UI in real-time
        }
    } catch (error) {
        console.error('Error:', error);
        return '';
    }
};

export const generateFileContent = async (
    genAI: GoogleGenerativeAI,
    prompt: string,
    callback?: (text: string) => void,
    chatHistory?: ChatHistory
): Promise<FileGenerationResponse> => {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        systemInstruction: `You are an AI assistant specializing in generating file content based on user requests. Your goal is to create well-structured and practical content that follows best practices. Always include explanations for the generated content.
        Respond in plain text format with the following structure:
        Content: The generated file content
        Explanation: A clear explanation of what was generated and why
        File Type (optional): Suggested file extension, if applicable
        Suggested File Name (optional): A recommended name for the file, if relevant`,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
    });

    try {
        // Build context from chat history
        let contextPrompt = '';
        if (chatHistory && chatHistory.messages.length > 0) {
            contextPrompt = 'Previous conversation:\n';
            chatHistory.messages.forEach((msg) => {
                contextPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });
            contextPrompt += '\nNow considering this context, please respond to:\n';
        }

        const fullPrompt = contextPrompt + prompt;
        const result = await model.generateContentStream(fullPrompt);
        let fullResponse = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            callback?.(chunkText);
        }

        try {
            // Try to parse the response as JSON
            const jsonMatch = fullResponse.match(/```json\n([\s\S]*)\n```/) || fullResponse.match(/{[\s\S]*}/);
            const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : fullResponse;
            return JSON.parse(jsonStr) as FileGenerationResponse;
        } catch (e) {
            // Fallback if JSON parsing fails
            return {
                content: fullResponse,
                explanation: 'Generated content based on your request.',
            };
        }
    } catch (error) {
        console.error('Error generating file content:', error);
        throw error;
    }
};

export const transformTextStyle = async (genAI: any, text: string, targetStyle: string): Promise<StyleTransformResponse> => {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        systemInstruction: `You are a writing style transformation expert. Transform the provided text into the requested style while preserving the core meaning.
      For each style:
      - Professional: Clear, concise, formal language suitable for business
      - Academic: Scholarly tone with precise terminology and formal structure
      - Creative: Vivid language with metaphors and engaging narrative elements
      - Persuasive: Compelling arguments with rhetorical techniques
      - Conversational: Friendly, approachable tone as if speaking directly to the reader
      - Technical: Precise, jargon-appropriate explanations focusing on accuracy
      - Simplistic: Easy-to-understand language avoiding complexity
      - Poetic: Rhythmic, imagery-rich language with artistic expression`,
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ],
    });

    const prompt = `
    Transform the following text into a ${targetStyle} writing style:
    
    "${text}"
    `;

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: {
            type: 'object',
            properties: {
                elaborated: {
                    type: 'string',
                },
            },
        },
    };

    const styleGenerationConfig = {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseSchema: {
            type: 'object',
            properties: {
                transformed: {
                    type: 'string',
                    description: 'The transformed text in the requested style',
                },
                style: {
                    type: 'string',
                    description: 'The name of the style used for transformation',
                },
            },
            required: ['transformed', 'style'],
        },
    };

    const result = await model.generateContent(prompt, generationConfig);
    const response = await result.response;

    try {
        const responseJson = response.text();
        return JSON.parse(responseJson) as StyleTransformResponse;
    } catch (e) {
        // Fallback if JSON parsing fails
        return {
            transformed: response
                .text()
                .replace(/```json|```/g, '')
                .trim(),
            style: targetStyle,
        };
    }
};
