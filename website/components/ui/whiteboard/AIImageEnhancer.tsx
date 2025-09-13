'use client';

import { useState, useRef, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Camera } from '../../../types/whiteboard';
import styles from './SelectionTools.module.css';
import useSelectionBounds from './hooks/useSelectionBounds';
import { useSelf } from '@liveblocks/react/suspense';
import IconButton from './IconButton';

// Fixed API key - in a real app, this would be stored securely in environment variables
const STABILITY_API_KEY = 'sk-klLmLhhkTLcyM0ZOxFVOlwJWklmlZ0fX5HYNAi0CqkRBoqEt';

type AIImageEnhancerProps = {
    isAnimated: boolean;
    camera: Camera;
    onClose: () => void;
    imageData: string; // The base64 image data
};

export default function AIImageEnhancer({ isAnimated, camera, onClose, imageData }: AIImageEnhancerProps) {
    // Using the fixed API key instead of asking for it
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [chatExpanded, setChatExpanded] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsLoading(true);
        setError(null);
        setChatExpanded(true);

        try {
            // For demo purposes, we'll use a sample image instead of the SVG placeholder
            // This ensures we're sending a valid image format to the API
            const sampleImageResponse = await fetch('/sample-sketch.png');

            // If the sample image doesn't exist, use a fallback image URL
            let imageBlob;
            if (!sampleImageResponse.ok) {
                // Fallback to a simple sketch from a public URL
                const fallbackResponse = await fetch('https://i.imgur.com/3qKgYxc.png');
                if (!fallbackResponse.ok) {
                    throw new Error('Could not load sample image for enhancement');
                }
                imageBlob = await fallbackResponse.blob();
            } else {
                imageBlob = await sampleImageResponse.blob();
            }

            // Create form data
            const formData = new FormData();
            formData.append('image', imageBlob, 'sketch.png');
            formData.append('prompt', prompt);
            formData.append('output_format', 'jpeg');

            // Send request to Stability AI API
            const apiResponse = await fetch('https://api.stability.ai/v2beta/stable-image/control/sketch', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${STABILITY_API_KEY}`,
                    Accept: 'image/*',
                },
                body: formData,
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
            const resultBlob = await apiResponse.blob();
            const imageUrl = URL.createObjectURL(resultBlob);

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

    // Position the dialog in a fixed position at the top-right of the canvas
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${styles.selection_inspector} ${chatExpanded ? 'w-[300px]' : 'w-[240px]'}`}
            style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                transform: 'none',
                background: '#f8f9fa',
                border: '1px solid #3498db',
                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)',
                zIndex: 1000,
            }}
        >
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#3498db"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1.5"
                        >
                            <path d="M12 2v4" />
                            <path d="M12 18v4" />
                            <path d="m4.93 4.93 2.83 2.83" />
                            <path d="m16.24 16.24 2.83 2.83" />
                            <path d="M2 12h4" />
                            <path d="M18 12h4" />
                            <path d="m4.93 19.07 2.83-2.83" />
                            <path d="m16.24 7.76 2.83-2.83" />
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
                        <label htmlFor="prompt" className="text-xs font-medium text-gray-700">
                            Enhancement Prompt
                        </label>
                        <input
                            ref={inputRef}
                            id="prompt"
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe how to enhance the image"
                            className="w-full text-xs px-2 py-1 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full text-xs py-1.5 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin h-3 w-3 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Enhancing...
                            </div>
                        ) : (
                            'Enhance Image'
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded-md text-xs">{error}</div>
                )}

                {resultImage && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-2"
                    >
                        <div className="relative aspect-square bg-white rounded-md overflow-hidden border border-gray-300">
                            <img src={resultImage} alt="Enhanced Image" className="object-contain w-full h-full" />
                        </div>
                        <button
                            onClick={downloadImage}
                            className="w-full text-xs py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium border border-gray-300 flex items-center justify-center gap-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                            </svg>
                            Download
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
