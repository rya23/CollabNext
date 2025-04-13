"use client";

import { useState } from "react";

interface GeneratedImage {
  data: string;
  mimeType: string;
}

export default function ComicGenerator() {
  const [story, setStory] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [responseText, setResponseText] = useState<string | null>(null);

  const handleGeneratePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!story.trim()) {
      setError("Please enter a story");
      return;
    }

    try {
      setIsGeneratingPrompt(true);
      setError(null);
      
      const response = await fetch("/api/generate-comic-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ story }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate comic prompt");
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedPrompt) {
      setError("No prompt available to generate image");
      return;
    }

    try {
      setIsGeneratingImage(true);
      setError(null);
      
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: generatedPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImages(data.images || []);
      setResponseText(data.text || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Comic Strip Generator</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          First, enter a story idea. The AI will convert it into a comic strip prompt, which will then be used to generate images.
        </p>
      </div>
      
      <form onSubmit={handleGeneratePrompt} className="mb-8">
        <div className="flex flex-col space-y-4">
          <label htmlFor="story" className="text-lg font-medium">
            Enter your story idea:
          </label>
          <textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
            placeholder="E.g., A cat and dog go on an adventure in space and discover a planet made of cheese..."
            disabled={isGeneratingPrompt || isGeneratingImage}
          />
          
          <button
            type="submit"
            disabled={isGeneratingPrompt || isGeneratingImage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPrompt ? "Generating Prompt..." : "Generate Comic Prompt"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {generatedPrompt && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generated Comic Prompt:</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingImage ? "Generating Comic..." : "Generate Comic Images"}
            </button>
          </div>
        </div>
      )}

      {generatedImages.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Generated Comic:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.map((image, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-md">
                <div className="relative aspect-square">
                  <img
                    src={`data:${image.mimeType};base64,${image.data}`}
                    alt={`Comic  ${index + 1}`}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {responseText && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-xl font-medium mb-2">AI Response:</h3>
          <p className="whitespace-pre-wrap">{responseText}</p>
        </div>
      )}
    </div>
  );
}
