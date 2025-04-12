import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { genAI } from '@/lib/geminiInstance';
import { getGeminiModel } from '@/lib/gemini';

interface StoryAnalysis {
    type: 'theme' | 'arc' | 'engagement';
    content: string;
}

interface StoryAnalysisProps {
    editor: Editor;
    isVisible: boolean;
    onClose: () => void;
}

interface AnalysisState {
    theme: string;
    arc: string;
    engagement: string;
}

const StoryAnalysis: React.FC<StoryAnalysisProps> = ({ editor, isVisible, onClose }) => {
    const [analysis, setAnalysis] = useState<AnalysisState>({
        theme: '',
        arc: '',
        engagement: '',
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalyzedContent, setLastAnalyzedContent] = useState('');

    const analyzeSpecificElement = async (content: string, elementType: 'theme' | 'arc' | 'engagement') => {
        const prompts = {
            theme: `
                Analyze the following story content and identify the main theme.
                Focus on the central idea, motif, or recurring concept that defines this story.
                Provide a concise but comprehensive analysis of the primary theme.
                
                Story Content: "${content}"
                
                Respond with just the theme analysis, no additional formatting.
            `,
            arc: `
                Analyze the following story content and identify the main narrative arc.
                Focus on the central plot development or character journey that drives this story.
                Provide a concise but comprehensive analysis of the primary story arc.
                
                Story Content: "${content}"
                
                Respond with just the narrative arc analysis, no additional formatting.
            `,
            engagement: `
                Analyze the following story content and identify the primary audience engagement factor.
                Focus on the main hook, tension point, or emotional element that would engage readers.
                Provide a concise but comprehensive analysis of what will keep readers interested.
                
                Story Content: "${content}"
                
                Respond with just the engagement analysis, no additional formatting.
            `,
        };

        const model = getGeminiModel(genAI);
        try {
            const result = await model.generateContent(prompts[elementType]);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error(`Analysis error for ${elementType}:`, error);
            return '';
        }
    };

    const analyzeContent = async (content: string) => {
        if (content === lastAnalyzedContent || content.length < 50) return;

        setIsAnalyzing(true);
        try {
            const [theme, arc, engagement] = await Promise.all([
                analyzeSpecificElement(content, 'theme'),
                analyzeSpecificElement(content, 'arc'),
                analyzeSpecificElement(content, 'engagement'),
            ]);

            setAnalysis({
                theme,
                arc,
                engagement,
            });
            setLastAnalyzedContent(content);
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Analyze content when it changes
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (editor && isVisible) {
                const content = editor.getText();
                analyzeContent(content);
            }
        }, 1000);

        return () => clearTimeout(debounceTimer);
    }, [editor?.getText(), isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed right-0 top-10 h-screen w-80 bg-white shadow-lg border-l p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Story Analysis</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                    ×
                </button>
            </div>

            {isAnalyzing && <div className="text-gray-500 italic">Analyzing your story...</div>}

            <div className="space-y-6">
                {/* Theme Section */}
                <div>
                    <h3 className="font-medium text-gray-800 mb-2">Main Theme</h3>
                    {analysis.theme ? (
                        <div className="p-3 bg-blue-50 rounded">
                            <p>{analysis.theme}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No theme identified yet</p>
                    )}
                </div>

                {/* Narrative Arc Section */}
                <div>
                    <h3 className="font-medium text-gray-800 mb-2">Narrative Arc</h3>
                    {analysis.arc ? (
                        <div className="p-3 bg-green-50 rounded">
                            <p>{analysis.arc}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No narrative arc identified yet</p>
                    )}
                </div>

                {/* Engagement Section */}
                <div>
                    <h3 className="font-medium text-gray-800 mb-2">Audience Engagement</h3>
                    {analysis.engagement ? (
                        <div className="p-3 bg-purple-50 rounded">
                            <p>{analysis.engagement}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No engagement factors identified yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryAnalysis;
