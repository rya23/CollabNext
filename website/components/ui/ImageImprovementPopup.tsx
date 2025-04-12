"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageImprovementOption = {
  id: string;
  label: string;
  description: string;
  prompt: string;
};

const improvementOptions: ImageImprovementOption[] = [
  {
    id: "enhance",
    label: "Enhance Details",
    description: "Add more details and clarity",
    prompt: "Enhance this image with more details and clarity, maintaining the same style and composition",
  },
  {
    id: "realistic",
    label: "Make Realistic",
    description: "Add photorealistic qualities",
    prompt: "Make this image more photorealistic while preserving the composition and subject matter",
  },
  {
    id: "stylize",
    label: "Artistic Style",
    description: "Apply artistic enhancement",
    prompt: "Apply an artistic style to this image, making it more visually interesting while preserving the composition",
  },
  {
    id: "lighting",
    label: "Better Lighting",
    description: "Enhance lighting and shadows",
    prompt: "Improve the lighting and shadows in this image for better visual impact",
  },
  {
    id: "colorize",
    label: "Vibrant Colors",
    description: "Make colors more vibrant",
    prompt: "Enhance the colors in this image to make them more vibrant and appealing",
  }
];

interface ImageImprovementPopupProps {
  isVisible: boolean;
  position: { x: number, y: number };
  onClose: () => void;
  onSelectOption: (prompt: string) => void;
}

export default function ImageImprovementPopup({
  isVisible,
  position,
  onClose,
  onSelectOption
}: ImageImprovementPopupProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelectOption = (option: ImageImprovementOption) => {
    setSelectedOption(option.id);
    onSelectOption(option.prompt);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 p-3 rounded-xl bg-gray-900/90 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/10 w-[260px]"
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -110%)",
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>
                Improve Your Image
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-2">Select an option to enhance your image:</p>
            
            <div className="grid grid-cols-1 gap-1.5">
              {improvementOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    "justify-start text-left h-auto py-2 px-3 rounded-md w-full",
                    selectedOption === option.id 
                      ? "bg-purple-600/30 text-purple-200 border-l-2 border-purple-400" 
                      : "hover:bg-purple-600/20 text-gray-300 hover:text-white"
                  )}
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-gray-400">{option.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
