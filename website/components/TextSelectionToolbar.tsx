'use client';

import React, { useState, useEffect, useRef } from 'react';
import { genAI } from '../lib/geminiInstance';
import { Editor } from '@tiptap/core';
import {
    summarizeText,
    correctGrammar,
    translateText,
    elaborateText,
    transformTextStyle,
    SummarizeResponse,
    GrammarCorrectionResponse,
    TranslateResponse,
    ElaborateResponse,
    StyleTransformResponse,
} from '../lib/gemini';
import { PhotoIcon } from '@heroicons/react/24/outline';

type ToolbarPosition = {
    top: number;
    left: number;
    visible: boolean;
};

type ActionType = 'summarize' | 'grammar' | 'translate' | 'elaborate' | 'style' | 'image';

type ResultType =
    | SummarizeResponse
    | GrammarCorrectionResponse
    | TranslateResponse
    | ElaborateResponse
    | StyleTransformResponse
    | GeneratedImageResponse
    | null;

interface GeneratedImage {
    data: string;
    mimeType: string;
}

interface GeneratedImageResponse {
    images: GeneratedImage[];
    text: string;
    generatedPrompt?: string;
}

interface TextSelectionToolbarProps {
    editor: Editor;
}

const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({ editor }) => {
    const [position, setPosition] = useState<ToolbarPosition>({
        top: 0,
        left: 0,
        visible: false,
    });
    const [selectedText, setSelectedText] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [result, setResult] = useState<ResultType>(null);
    const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
    const [translateLanguage, setTranslateLanguage] = useState<string>('Spanish');
    const [showTranslateOptions, setShowTranslateOptions] = useState<boolean>(false);
    const [editableText, setEditableText] = useState<string>('');
    const [styleOption, setStyleOption] = useState<string>('Professional');
    const [showStyleOptions, setShowStyleOptions] = useState<boolean>(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

    const toolbarRef = useRef<HTMLDivElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Handle text selection
    useEffect(() => {
        if (!editor) return;

        const checkSelection = () => {
            // If editor is not focused or has no selection, hide toolbar
            if (!editor.isActive || !editor.state.selection.content().size) {
                setPosition({ ...position, visible: false });
                return;
            }

            const domSelection = window.getSelection();
            if (!domSelection || domSelection.rangeCount === 0) return;

            const domRange = domSelection.getRangeAt(0);
            const rect = domRange.getBoundingClientRect();

            // Get selected text from Tiptap
            const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');

            if (text.trim().length > 0) {
                setSelectedText(text);

                // Position toolbar above selection
                const toolbarHeight = toolbarRef.current?.offsetHeight || 40;
                const newTop = window.scrollY + rect.top - toolbarHeight - 10;
                const newLeft = window.scrollX + rect.left + rect.width / 2;

                setPosition({
                    top: newTop,
                    left: newLeft,
                    visible: true,
                });
            }
        };

        // Add selection change listener to editor
        const selectionHandler = () => {
            setTimeout(checkSelection, 0);
        };

        editor.on('selectionUpdate', selectionHandler);
        document.addEventListener('mouseup', checkSelection);

        return () => {
            editor.off('selectionUpdate', selectionHandler);
            document.removeEventListener('mouseup', checkSelection);
        };
    }, [editor, position]);

    // Close toolbar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                toolbarRef.current &&
                target &&
                !toolbarRef.current.contains(target) &&
                resultRef.current &&
                !resultRef.current.contains(target)
            ) {
                setPosition({ ...position, visible: false });
                setResult(null);
                setCurrentAction(null);
                setShowTranslateOptions(false);
                setShowStyleOptions(false);
                setEditableText('');
                setGeneratedImages([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [position]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [editableText]);

    const handleAction = async (action: ActionType) => {
        setCurrentAction(action);
        setIsProcessing(true);

        try {
            let actionResult: ResultType = null;

            switch (action) {
                case 'summarize':
                    actionResult = await summarizeText(genAI, selectedText);
                    setEditableText((actionResult as SummarizeResponse).summary);
                    break;
                case 'grammar':
                    actionResult = await correctGrammar(genAI, selectedText);
                    setEditableText((actionResult as GrammarCorrectionResponse).corrected);
                    break;
                case 'translate':
                    if (!showTranslateOptions) {
                        setShowTranslateOptions(true);
                        setIsProcessing(false);
                        return;
                    }
                    actionResult = await translateText(genAI, selectedText, translateLanguage);
                    setEditableText((actionResult as TranslateResponse).translated);
                    break;
                case 'elaborate':
                    actionResult = await elaborateText(genAI, selectedText);
                    setEditableText((actionResult as ElaborateResponse).elaborated);
                    break;
                case 'style':
                    if (!showStyleOptions) {
                        setShowStyleOptions(true);
                        setIsProcessing(false);
                        return;
                    }
                    actionResult = await transformTextStyle(genAI, selectedText, styleOption);
                    setEditableText((actionResult as StyleTransformResponse).transformed);
                    break;
                case 'image':
                    setIsGeneratingImage(true);
                    try {
                        // First generate a comic prompt from the selected text
                        const promptResponse = await fetch('/api/generate-comic-prompt', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                story: selectedText,
                                history: [],
                            }),
                        });

                        if (!promptResponse.ok) {
                            const errorData = await promptResponse.json();
                            throw new Error(errorData.error || 'Failed to generate comic prompt');
                        }

                        const promptData = await promptResponse.json();
                        const comicPrompt = promptData.prompt || selectedText;
                        setGeneratedPrompt(comicPrompt);

                        // Then use the generated prompt to create the image
                        const imageResponse = await fetch('/api/generate-image', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ prompt: comicPrompt }),
                        });

                        if (!imageResponse.ok) {
                            const errorData = await imageResponse.json();
                            throw new Error(errorData.error || 'Failed to generate image');
                        }

                        const imageData = await imageResponse.json();
                        setGeneratedImages(imageData.images || []);
                        actionResult = {
                            images: imageData.images || [],
                            text: imageData.text || 'Generated image based on your text',
                            generatedPrompt: comicPrompt,
                        } as GeneratedImageResponse;
                    } catch (error) {
                        console.error('Error generating image:', error);
                        setResult({ error: 'Failed to generate image' } as any);
                    } finally {
                        setIsGeneratingImage(false);
                    }
                    break;
            }

            setResult(actionResult);
        } catch (error) {
            console.error('Error processing text:', error);
            setResult({ error: 'Failed to process your request' } as any);
            setEditableText('Error processing request. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Replace original text with the AI-generated and possibly user-edited text
    const replaceOriginalText = () => {
        if (!editor) return;

        if (currentAction === 'image' && generatedImages.length > 0) {
            insertImageIntoEditor(generatedImages[0]);
            return;
        }

        if (!editableText) return;

        try {
            // Delete the selected content and insert the new text
            editor.chain().focus().deleteSelection().insertContent(editableText).run();

            // Close the toolbar and reset state
            setPosition({ ...position, visible: false });
            setResult(null);
            setCurrentAction(null);
            setEditableText('');
            setGeneratedImages([]);

            // Focus back on the editor
            editor.commands.focus();
        } catch (error) {
            console.error('Error replacing text:', error);
            alert('Failed to replace text. Please try again.');
        }
    };

    // Insert image into editor
    const insertImageIntoEditor = (image: GeneratedImage) => {
        if (!editor || !editor.isEditable) return;

        try {
            // Create a data URL from the base64 image data
            const imageUrl = `data:${image.mimeType};base64,${image.data}`;

            // Store the current selection position
            const { from, to } = editor.state.selection;

            // Insert the image after the current selection without deleting the selection
            // First move to the end of the selection
            editor.chain().focus().setTextSelection(to).run();

            // Then insert the image at that position
            // We'll use a simple image insertion and rely on CSS to control the size
            editor.chain().setImage({ src: imageUrl }).run();

            // Note: Image resizing is handled via CSS in the editor's stylesheet
            // The editor should have a rule like: .ProseMirror img { max-width: 300px; height: auto; }

            // Close the toolbar and reset state
            setPosition({ ...position, visible: false });
            setResult(null);
            setCurrentAction(null);
            setEditableText('');
            setGeneratedImages([]);

            // Focus back on the editor
            editor.commands.focus();
        } catch (error) {
            console.error('Error inserting image into editor:', error);
            alert('Failed to insert image. Please try again.');
        }
    };

    const renderResult = () => {
        if (!result) return null;

        if (currentAction === 'image' && (result as GeneratedImageResponse)?.images?.length > 0) {
            const images = (result as GeneratedImageResponse).images;
            const prompt = (result as GeneratedImageResponse).generatedPrompt;
            return (
                <div className="mb-4 w-full">
                    <h3 className="text-lg font-semibold mb-2">Generated Image</h3>
                    {prompt && (
                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                            <p className="font-medium mb-1">Generated from prompt:</p>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{prompt}</p>
                        </div>
                    )}
                    <div className={`grid ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mt-2`}>
                        {images.map((image, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden shadow-md">
                                <div className="relative aspect-square">
                                    <img
                                        src={`data:${image.mimeType};base64,${image.data}`}
                                        alt={`Generated image ${index + 1}`}
                                        className="object-contain w-full h-full"
                                        width="150"
                                        height="150"
                                    />
                                </div>
                                <div className="p-2 bg-gray-50 flex justify-center">
                                    <button
                                        onClick={() => insertImageIntoEditor(image)}
                                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Insert this image
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-4 w-full">
                <h3 className="text-lg font-semibold mb-2">
                    {currentAction === 'summarize'
                        ? 'Summary'
                        : currentAction === 'grammar'
                        ? 'Grammar Correction'
                        : currentAction === 'translate'
                        ? `Translation (${(result as TranslateResponse).language})`
                        : currentAction === 'elaborate'
                        ? 'Elaborated Text'
                        : currentAction === 'style'
                        ? `Style: ${(result as StyleTransformResponse).style}`
                        : 'Result'}
                </h3>

                <textarea
                    ref={textareaRef}
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md min-h-[100px] resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    placeholder="Edit generated text here..."
                />

                {currentAction === 'grammar' &&
                    (result as GrammarCorrectionResponse).changes &&
                    (result as GrammarCorrectionResponse).changes.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-md font-semibold mb-2">Changes Made:</h4>
                            <ul className="list-disc pl-5 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                                {(result as GrammarCorrectionResponse).changes.map((change, index) => (
                                    <li key={index} className="mb-2">
                                        <span className="line-through text-red-500">{change.original}</span>
                                        {' → '}
                                        <span className="text-green-500">{change.correction}</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{change.explanation}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
            </div>
        );
    };

    if (!position.visible && !result) return null;

    return (
        <>
            {/* Toolbar */}
            <div
                ref={toolbarRef}
                className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 flex items-center gap-2 transition-opacity transform -translate-x-1/2 border border-gray-200 dark:border-gray-700"
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    opacity: position.visible ? 1 : 0,
                    display: result ? 'none' : 'flex',
                }}
            >
                <button
                    onClick={() => handleAction('summarize')}
                    disabled={isProcessing}
                    className="px-3 py-1 border-2 border-black bg-white hover:bg-black text-black hover:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Summarize
                </button>
                <button
                    onClick={() => handleAction('grammar')}
                    disabled={isProcessing}
                    className="px-3 py-1 bg-white hover:bg-black text-black hover:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Grammar
                </button>
                <button
                    onClick={() => handleAction('translate')}
                    disabled={isProcessing}
                    className="px-3 py-1 bg-white hover:bg-black text-black hover:text-white  rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Translate
                </button>
                <button
                    onClick={() => handleAction('elaborate')}
                    disabled={isProcessing}
                    className="px-3 py-1 bg-white hover:bg-black text-black hover:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Elaborate
                </button>
                <button
                    onClick={() => handleAction('style')}
                    disabled={isProcessing}
                    className="px-3 py-1 bg-white hover:bg-black text-black hover:text-white  rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Style
                </button>
                <button
                    onClick={() => handleAction('image')}
                    disabled={isProcessing || isGeneratingImage}
                    className="px-3 py-1 bg-white hover:bg-black text-black hover:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                    <PhotoIcon className="w-4 h-4" />
                    Image
                </button>

                {showTranslateOptions && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                        <select
                            value={translateLanguage}
                            onChange={(e) => setTranslateLanguage(e.target.value)}
                            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        >
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Italian">Italian</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Russian">Russian</option>
                            <option value="Arabic">Arabic</option>
                            <option value="Hindi">Hindi</option>
                        </select>
                        <button
                            onClick={() => handleAction('translate')}
                            className="ml-2 px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                        >
                            Translate
                        </button>
                    </div>
                )}

                {showStyleOptions && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                        <select
                            value={styleOption}
                            onChange={(e) => setStyleOption(e.target.value)}
                            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        >
                            <option value="Professional">Professional</option>
                            <option value="Academic">Academic</option>
                            <option value="Creative">Creative</option>
                            <option value="Persuasive">Persuasive</option>
                            <option value="Conversational">Conversational</option>
                            <option value="Technical">Technical</option>
                            <option value="Simplistic">Simplistic</option>
                            <option value="Poetic">Poetic</option>
                        </select>
                        <button
                            onClick={() => handleAction('style')}
                            className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                )}
            </div>

            {/* Result Panel */}
            {result && (
                <div
                    ref={resultRef}
                    className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 max-w-md w-full border border-gray-200 dark:border-gray-700"
                    style={{
                        // Position the panel in the center of the screen instead of relative to selection
                        // This prevents overflow issues
                        top: '60%',
                        left: '85%',
                        transform: 'translate(-50%, -50%)',
                        maxHeight: '80vh',
                        // maxWidth: '90vw',
                        overflow: 'auto',
                    }}
                >
                    {renderResult()}

                    <div className="flex justify-between gap-2 mt-4">
                        <button
                            onClick={() => {
                                setResult(null);
                                setCurrentAction(null);
                                setPosition({ ...position, visible: false });
                                setEditableText('');
                            }}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={replaceOriginalText}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                        >
                            Replace Original Text
                        </button>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {isProcessing && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 border border-gray-200 dark:border-gray-700"
                    style={{
                        top: `${position.top + 50}px`,
                        left: `${position.left}px`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
                        <p className="text-gray-800 dark:text-gray-200">Processing...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default TextSelectionToolbar;
