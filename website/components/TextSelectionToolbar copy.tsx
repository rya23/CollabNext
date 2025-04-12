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

type ToolbarPosition = {
    top: number;
    left: number;
    visible: boolean;
};

type ActionType = 'summarize' | 'grammar' | 'translate' | 'elaborate' | 'style';

type ResultType =
    | SummarizeResponse
    | GrammarCorrectionResponse
    | TranslateResponse
    | ElaborateResponse
    | StyleTransformResponse
    | null;

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
        if (!editor || !editableText) return;

        try {
            // Delete the selected content and insert the new text
            editor.chain().focus().deleteSelection().insertContent(editableText).run();

            // Close the toolbar and reset state
            setPosition({ ...position, visible: false });
            setResult(null);
            setCurrentAction(null);
            setEditableText('');

            // Focus back on the editor
            editor.commands.focus();
        } catch (error) {
            console.error('Error replacing text:', error);
            alert('Failed to replace text. Please try again.');
        }
    };

    const renderResult = () => {
        if (!result) return null;

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
                        top: `${position.top + 50}px`,
                        left: `${position.left}px`,
                        transform: 'translateX(-50%)',
                        maxHeight: '80vh',
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
