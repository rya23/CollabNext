"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ImageImprovementPopup from "@/components/ui/ImageImprovementPopup";

export default function SketchGenerator() {
  const [apiKey, setApiKey] = useState("");
  const [sketch, setSketch] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [controlStrength, setControlStrength] = useState(0.7);
  const [seed, setSeed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showImprovementPopup, setShowImprovementPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultImageRef = useRef<HTMLImageElement>(null);

  const handleSketchChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSketch(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setSketchPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
      
      // Clear previous result and error
      setResultImage(null);
      setError(null);
    }
  };

  // Function to position the popup when the Improve button is clicked
  const positionAndShowPopup = () => {
    if (resultImageRef.current) {
      const rect = resultImageRef.current.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setShowImprovementPopup(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!sketch || !apiKey.trim() || !prompt.trim()) {
      setError("Please provide API key, sketch image, and prompt");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShowImprovementPopup(false);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', sketch);
    formData.append('prompt', prompt);
    
    if (negativePrompt.trim()) {
      formData.append('negative_prompt', negativePrompt);
    }
    
    formData.append('control_strength', controlStrength.toString());
    formData.append('seed', seed.toString());
    formData.append('output_format', 'jpeg');
    
    try {
      // Send direct request to Stability API
      const response = await fetch('https://api.stability.ai/v2beta/stable-image/control/sketch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*'
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          // Try to get detailed error info
          const errorData = await response.json();
          errorText = errorData.message || `Error: ${response.status} ${response.statusText}`;
        } catch {
          errorText = `Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorText);
      }
      
      // Handle successful image generation
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Store the original image if this is the first generation
      if (!originalImage) {
        setOriginalImage(imageUrl);
      }
      
      // Display the generated image
      setResultImage(imageUrl);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during image generation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImprovementSelect = (improvementPrompt: string) => {
    // Combine the original prompt with the improvement prompt
    const enhancedPrompt = `${prompt}. ${improvementPrompt}`;
    setPrompt(enhancedPrompt);
    setShowImprovementPopup(false);
    
    // Auto-submit the form with the new prompt
    handleSubmit(new Event('submit') as unknown as FormEvent);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Sketch to Image Generator
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Transform your hand-drawn sketches into detailed, professional images with AI
          </p>
        </div>

        <div className="mb-8 p-4 bg-purple-900/10 border border-purple-700/20 rounded-md">
          <p className="text-sm text-purple-300">
            This tool requires a Stability AI API key to function. Your API key remains in your browser and is only sent to Stability AI.
          </p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div 
          className="lg:col-span-3 order-2 lg:order-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5 p-6 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium text-gray-200">
                  Stability AI API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="bg-gray-800/50 border-gray-700 focus:border-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="sketchInput" className="text-sm font-medium text-gray-200">
                  Upload Sketch
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="sketchInput"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleSketchChange}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed border-2 h-24 bg-gray-800/30 hover:bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-all duration-300"
                  >
                    {sketchPreview ? "Change Sketch" : "Click to Upload Sketch"}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="prompt" className="text-sm font-medium text-gray-200">
                  Text Prompt
                </label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate (e.g., a creepy wooden cathedral in the forest)"
                  className="min-h-[120px] bg-gray-800/50 border-gray-700 focus:border-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="negativePrompt" className="text-sm font-medium text-gray-200 flex items-center gap-2">
                  Negative Prompt
                  <span className="text-xs text-gray-400">(Optional)</span>
                </label>
                <Textarea
                  id="negativePrompt"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Describe what you want to avoid in the image"
                  className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="controlStrength" className="text-sm font-medium text-gray-200 flex items-center justify-between">
                    <span>Control Strength</span>
                    <span className="text-sm text-purple-400 font-mono">{controlStrength}</span>
                  </label>
                  <Input
                    id="controlStrength"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={controlStrength}
                    onChange={(e) => setControlStrength(parseFloat(e.target.value))}
                    className="bg-gray-800/50 border-gray-700 accent-purple-500"
                  />
                  <p className="text-xs text-gray-400">Higher values make the output more closely match your sketch</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="seed" className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    Seed
                    <span className="text-xs text-gray-400">(Optional)</span>
                  </label>
                  <Input
                    id="seed"
                    type="number"
                    min="0"
                    step="1"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value))}
                    placeholder="Random seed if left at 0"
                    className="bg-gray-800/50 border-gray-700 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400">Set a specific seed for reproducible results</p>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !sketch || !apiKey.trim() || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Image...
                  </div>
                ) : (
                  "Generate Image"
                )}
              </Button>
            </div>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mt-6 bg-red-900/20 border border-red-700/30 text-red-200 rounded-md"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
        
        <motion.div 
          className="lg:col-span-2 order-1 lg:order-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="sticky top-24 space-y-6">
            {sketchPreview && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm overflow-hidden"
              >
                <h3 className="text-lg font-semibold text-white mb-3">Your Sketch</h3>
                <div className="relative aspect-square bg-gray-800/50 rounded-md overflow-hidden">
                  <img
                    src={sketchPreview}
                    alt="Sketch Preview"
                    className="object-contain w-full h-full"
                  />
                </div>
              </motion.div>
            )}
            
            {resultImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm overflow-hidden"
              >
                <h3 className="text-lg font-semibold text-white mb-3">Generated Image</h3>
                <div className="relative aspect-square bg-gray-800/50 rounded-md overflow-hidden">
                  <img
                    ref={resultImageRef}
                    src={resultImage}
                    alt="Generated Image"
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="mt-3 flex justify-between">
                  <Button
                    onClick={positionAndShowPopup}
                    variant="outline"
                    size="sm"
                    className="text-sm border-purple-600/30 text-purple-400 hover:bg-purple-600/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>
                    Improve
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = resultImage;
                      link.download = `sketch-to-image-${Date.now()}.jpg`;
                      link.click();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-sm border-purple-600/30 text-purple-400 hover:bg-purple-600/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Download
                  </Button>
                </div>
              </motion.div>
            )}
            
            {!sketchPreview && !resultImage && (
              <div className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Upload a sketch to get started</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {/* Image Improvement Popup */}
      <ImageImprovementPopup
        isVisible={showImprovementPopup}
        position={popupPosition}
        onClose={() => setShowImprovementPopup(false)}
        onSelectOption={handleImprovementSelect}
      />
    </div>
  );
}
