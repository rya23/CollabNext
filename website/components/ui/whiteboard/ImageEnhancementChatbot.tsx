import { useState, useRef, FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useStorage } from '@liveblocks/react/suspense';
import { Camera, Layer } from './types';
import styles from './SelectionTools.module.css';
import useSelectionBounds from './hooks/useSelectionBounds';
import { useSelf } from '@liveblocks/react/suspense';
import IconButton from './IconButton';

type ImageEnhancementChatbotProps = {
  isAnimated: boolean;
  camera: Camera;
  onClose: () => void;
};

export default function ImageEnhancementChatbot({ 
  isAnimated, 
  camera, 
  onClose 
}: ImageEnhancementChatbotProps) {
  const selection = useSelf((me) => me.presence.selection);
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get access to the storage
  const layers = useStorage((root) => root.layers);
  
  // Load the selected image when the component mounts
  useEffect(() => {
    if (selection.length === 1) {
      const selectedLayer = layers.get(selection[0]);
      if (selectedLayer && selectedLayer.get('type') === 'image') {
        setSelectedImage(selectedLayer.get('src') as string);
      }
    }
  }, [selection, layers]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage || !apiKey.trim() || !prompt.trim()) {
      setError("Please provide API key, select an image, and enter a prompt");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setChatExpanded(true);
    
    try {
      // Convert base64 image to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'image.png');
      formData.append('prompt', prompt);
      formData.append('output_format', 'jpeg');
      
      // Send request to Stability API
      const apiResponse = await fetch('https://api.stability.ai/v2beta/stable-image/control/sketch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*'
        },
        body: formData
      });
      
      if (!apiResponse.ok) {
        let errorText = '';
        try {
          const errorData = await apiResponse.json();
          errorText = errorData.message || `Error: ${apiResponse.status} ${apiResponse.statusText}`;
        } catch {
          errorText = `Error: ${apiResponse.status} ${apiResponse.statusText}`;
        }
        throw new Error(errorText);
      }
      
      // Handle successful image generation
      const imageBlob = await apiResponse.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Display the generated image
      setResultImage(imageUrl);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during image generation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `enhanced-image-${Date.now()}.jpg`;
      link.click();
    }
  };
  
  const selectionBounds = useSelectionBounds();
  if (!selectionBounds) {
    return null;
  }

  const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
  const y = selectionBounds.y + camera.y;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${styles.selection_inspector} ${chatExpanded ? 'w-[300px]' : 'w-[240px]'}`}
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
      }}
    >
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
              <path d="m4.93 4.93 2.83 2.83"/>
              <path d="m16.24 16.24 2.83 2.83"/>
              <path d="M2 12h4"/>
              <path d="M18 12h4"/>
              <path d="m4.93 19.07 2.83-2.83"/>
              <path d="m16.24 7.76 2.83-2.83"/>
            </svg>
            AI Image Enhancer
          </h3>
          <IconButton onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </IconButton>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-1">
            <label htmlFor="apiKey" className="text-xs font-medium text-gray-300">
              Stability AI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full text-xs px-2 py-1 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="prompt" className="text-xs font-medium text-gray-300">
              Enhancement Prompt
            </label>
            <input
              ref={inputRef}
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how to enhance the image"
              className="w-full text-xs px-2 py-1 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !selectedImage || !apiKey.trim() || !prompt.trim()}
            className="w-full text-xs py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enhancing...
              </div>
            ) : (
              "Enhance Image"
            )}
          </button>
        </form>
        
        {error && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-700/30 text-red-200 rounded-md text-xs">
            {error}
          </div>
        )}
        
        {resultImage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            <div className="relative aspect-square bg-gray-800/50 rounded-md overflow-hidden border border-gray-700">
              <img
                src={resultImage}
                alt="Enhanced Image"
                className="object-contain w-full h-full"
              />
            </div>
            <button
              onClick={downloadImage}
              className="w-full text-xs py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-700 flex items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Download
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
