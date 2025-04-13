import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, XMarkIcon, PhotoIcon, ArrowsPointingOutIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { generateFileContent, FileGenerationResponse } from '@/lib/gemini';
import { genAI } from '@/lib/geminiInstance';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';

interface AIChatProps {
    editor: Editor;
    isOpen: boolean;
    onClose: () => void;
    autoConvertMarkdown?: boolean;
}

type ChatMode = 'ai-chat' | 'comic-generator';

interface ChatHistory {
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    generatedContent?: FileGenerationResponse;
    timestamp?: number; // Add timestamp for sorting/reference
    generatedPrompt?: string;
    generatedImages?: GeneratedImage[];
}

interface GeneratedImage {
    data: string;
    mimeType: string;
}

const AIChat: React.FC<AIChatProps> = ({ editor, isOpen, onClose, autoConvertMarkdown = true }) => {
    const [chatMode, setChatMode] = useState<ChatMode>('ai-chat');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hi! I can help you generate code or content. What would you like to create?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);
    const [currentMessageImages, setCurrentMessageImages] = useState<GeneratedImage[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatScrollPositionRef = useRef(0);

    // Static prompt suggestions based on chat mode
    const aiChatPromptSuggestions = [
        'Write a short story about a time traveler stuck in the past',
        'Create a mystery story set in a small coastal town',
        'Write a sci-fi story about the first human contact with aliens',
        'Draft a romance story between rival bookstore owners',
        'Write a horror story that takes place during a blackout',
    ];

    const comicGeneratorPromptSuggestions = [
        'A story of breaking bad walter white and saul goodman',
        "A short panel series depicting the Titanic sinking from a seagull's POV",
        "Comic-style retelling of Romeo and Juliet's balcony scene",
        'A panel showing Frodo destroying the ring at Mount Doom',
        "A funny reinterpretation of Darth Vader revealing he's Luke's father",
    ];

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const getChatHistory = (): ChatHistory => {
        return {
            messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        };
    };

    const generateResponse = async (userInput: string) => {
        setIsGenerating(true);
        try {
            let response = '';
            const chatHistory = getChatHistory();
            const result = await generateFileContent(
                genAI,
                userInput,
                (partialResponse) => {
                    // Update the UI with streaming response
                    setMessages((prev) => {
                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage?.role === 'assistant') {
                            return [
                                ...prev.slice(0, -1),
                                {
                                    ...lastMessage,
                                    content: lastMessage.content + partialResponse,
                                    timestamp: Date.now(),
                                },
                            ];
                        }
                        return [
                            ...prev,
                            {
                                role: 'assistant',
                                content: partialResponse,
                                timestamp: Date.now(),
                            },
                        ];
                    });
                },
                chatHistory
            );

            return {
                content: result.explanation,
                generatedContent: result,
            };
        } catch (error) {
            console.error('Error generating response:', error);
            return {
                content: 'Sorry, I encountered an error while generating the content.',
                generatedContent: undefined,
            };
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        if (chatMode === 'ai-chat') {
            const aiResponse = await generateResponse(input);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: aiResponse.content,
                    generatedContent: aiResponse.generatedContent,
                    timestamp: Date.now(),
                },
            ]);
        } else if (chatMode === 'comic-generator') {
            await handleGenerateComicPrompt(input);
        }
    };

    const convertMarkdownToHtml = async (markdown: string): Promise<string> => {
        try {
            const result = await unified()
                .use(remarkParse)
                .use(remarkGfm)
                .use(remarkRehype)
                .use(rehypeStringify)
                .process(markdown);

            return result.toString();
        } catch (error) {
            console.error('Error converting markdown to HTML:', error);
            return markdown; // Return original text if conversion fails
        }
    };

    const insertGeneratedContent = async (content: FileGenerationResponse) => {
        if (!editor || !editor.isEditable) return;

        try {
            if (autoConvertMarkdown) {
                // If auto-convert is enabled, try to process as markdown first
                const html = await convertMarkdownToHtml(content.content);
                editor.chain().focus().insertContent(html).run();
            } else {
                // Otherwise insert as plain text
                editor.chain().focus().insertContent(content.content).run();
            }
        } catch (error) {
            console.error('Error inserting content:', error);
            // Fallback to plain text
            editor.chain().focus().insertContent(content.content).run();
        }
    };

    const insertAsMarkdown = async (markdown: string) => {
        if (!editor || !editor.isEditable) return;

        try {
            // Attempt to convert markdown to HTML
            const html = await convertMarkdownToHtml(markdown);

            // Insert the HTML content
            editor.chain().focus().insertContent(html).run();
        } catch (error) {
            console.error('Error inserting markdown:', error);
            // Fallback to inserting plain text
            editor.chain().focus().insertContent(markdown).run();
        }
    };

    const insertImageIntoEditor = (image: GeneratedImage) => {
        if (!editor || !editor.isEditable) return;

        try {
            // Create a data URL from the base64 image data
            const imageUrl = `data:${image.mimeType};base64,${image.data}`;

            // Insert the image into the editor
            editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
            console.error('Error inserting image into editor:', error);
        }
    };

    const openImageModal = (image: GeneratedImage, allImages: GeneratedImage[], index: number) => {
        // Save current scroll position before opening modal
        if (chatContainerRef.current) {
            chatScrollPositionRef.current = chatContainerRef.current.scrollTop;
        }

        setModalImage(image);
        setCurrentMessageImages(allImages);
        setCurrentImageIndex(index);
        setIsModalOpen(true);
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
        setModalImage(null);

        // Restore scroll position after closing modal
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatScrollPositionRef.current;
            }
        }, 100);
    };

    const navigateImages = (direction: 'next' | 'prev') => {
        if (currentMessageImages.length <= 1) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentImageIndex + 1) % currentMessageImages.length;
        } else {
            newIndex = (currentImageIndex - 1 + currentMessageImages.length) % currentMessageImages.length;
        }

        setCurrentImageIndex(newIndex);
        setModalImage(currentMessageImages[newIndex]);
    };

    const downloadImage = (image: GeneratedImage) => {
        try {
            // Create a data URL from the base64 image data
            const imageUrl = `data:${image.mimeType};base64,${image.data}`;

            // Get appropriate file extension
            const extension = getFileExtension(image.mimeType);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `comic-panel-${Date.now()}.${extension}`;

            // Append to the document, click it, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const downloadAllImages = () => {
        if (!currentMessageImages || currentMessageImages.length === 0) return;

        // Download each image with a slight delay to prevent browser issues
        currentMessageImages.forEach((image, index) => {
            setTimeout(() => downloadImage(image), index * 300);
        });
    };

    // Function to get file extension from mime type
    const getFileExtension = (mimeType: string): string => {
        const extensions: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
        };

        return extensions[mimeType] || 'png';
    };

    const getComicChatHistory = () => {
        // Filter messages to only include those relevant to comic generation
        // This includes user inputs and assistant responses with generatedPrompt
        return messages.filter((msg) => chatMode === 'comic-generator' && (msg.role === 'user' || msg.generatedPrompt));
    };

    const handleGenerateComicPrompt = async (storyInput: string) => {
        try {
            setIsGenerating(true);

            // Get relevant chat history for context
            const comicHistory = getComicChatHistory();

            const response = await fetch('/api/generate-comic-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    story: storyInput,
                    history: comicHistory,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate comic prompt');
            }

            const data = await response.json();
            const prompt = data.prompt || '';
            setGeneratedPrompt(prompt);

            // Add assistant message with the generated prompt
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "I've created a comic prompt based on your story:",
                    generatedPrompt: prompt,
                    timestamp: Date.now(),
                },
            ]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Error: ${errorMessage}`,
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateComicImage = async (prompt: string) => {
        try {
            setIsGeneratingImage(true);

            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate image');
            }

            const data = await response.json();

            // Add assistant message with the generated images
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.text || "Here's your generated comic:",
                    generatedImages: data.images || [],
                    timestamp: Date.now(),
                },
            ]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Error generating comic: ${errorMessage}`,
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const renderMessage = (message: Message) => {
        if (message.role === 'user') {
            return <p className="text-white">{message.content}</p>;
        }

        if (chatMode === 'ai-chat' && message.generatedContent) {
            return (
                <div>
                    <p className="mb-2">{message.generatedContent.explanation}</p>
                    <pre className="bg-gray-800 text-white p-2 rounded text-sm overflow-x-auto">
                        <code>{message.generatedContent.content}</code>
                    </pre>
                    <button
                        onClick={() => insertGeneratedContent(message.generatedContent!)}
                        className="mt-2 text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                        Insert into Editor
                    </button>
                </div>
            );
        } else if (chatMode === 'comic-generator' && message.generatedPrompt) {
            return (
                <div>
                    <p className="mb-2">{message.content}</p>
                    <div className="p-4 bg-gray-100 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm">{message.generatedPrompt}</pre>
                    </div>
                    <button
                        onClick={() => handleGenerateComicImage(message.generatedPrompt!)}
                        disabled={isGeneratingImage}
                        className="mt-2 text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-green-300"
                    >
                        {isGeneratingImage ? 'Generating Comic...' : 'Generate Comic Images'}
                    </button>
                </div>
            );
        } else if (chatMode === 'comic-generator' && message.generatedImages && message.generatedImages.length > 0) {
            return (
                <div>
                    <p className="mb-2">{message.content}</p>
                    <div className={`grid ${message.generatedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mt-2`}>
                        {message.generatedImages.map((image, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden shadow-md">
                                <div className="relative aspect-square group cursor-pointer">
                                    <img
                                        src={`data:${image.mimeType};base64,${image.data}`}
                                        alt={`Comic panel ${index + 1}`}
                                        className="object-contain w-full h-full"
                                        onClick={() => openImageModal(image, message.generatedImages || [], index)}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button
                                            className="p-2 bg-white rounded-full shadow-md mr-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openImageModal(image, message.generatedImages || [], index);
                                            }}
                                        >
                                            <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button
                                            className="p-2 bg-white rounded-full shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                insertImageIntoEditor(image);
                                            }}
                                        >
                                            <PlusCircleIcon className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 flex justify-center">
                                    <button
                                        onClick={() => insertImageIntoEditor(image)}
                                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Insert into Editor
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return <p>{message.content}</p>;
    };

    const switchMode = (mode: ChatMode) => {
        if (mode !== chatMode) {
            setChatMode(mode);

            // Only reset messages if switching TO comic-generator mode for the first time
            // or if switching back to AI chat mode
            if (mode === 'ai-chat' || !messages.some((msg) => msg.generatedPrompt)) {
                setMessages([
                    {
                        role: 'assistant',
                        content:
                            mode === 'ai-chat'
                                ? 'Hi! I can help you generate code or content. What would you like to create?'
                                : 'Hi! I can create comic strips based on your story ideas. What story would you like to turn into a comic? You can also suggest changes to previously generated comics.',
                    },
                ]);
            }

            setInput('');
            setShowPromptSuggestions(false);
            setGeneratedPrompt(null);
        }
    };

    // Handle selecting a prompt suggestion
    const handleSelectPromptSuggestion = (suggestion: string) => {
        setInput(suggestion);
        setShowPromptSuggestions(false);
    };

    return (
        <AnimatePresence>
            {isModalOpen && modalImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={closeImageModal}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white bg-opacity-90 rounded-lg max-w-3xl max-h-[90vh] w-full overflow-hidden shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 flex justify-between items-center border-b">
                            <div className="flex items-center">
                                <h3 className="font-medium mr-2">Comic Panel</h3>
                                {currentMessageImages.length > 1 && (
                                    <span className="text-sm text-gray-500">
                                        {currentImageIndex + 1} of {currentMessageImages.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={downloadAllImages}
                                    className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                    Download All
                                </button>
                                <button onClick={closeImageModal} className="p-1 hover:bg-gray-100 rounded">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex justify-center relative group">
                            <img
                                src={`data:${modalImage.mimeType};base64,${modalImage.data}`}
                                alt="Comic panel expanded view"
                                className="max-h-[70vh] object-contain"
                            />

                            {currentMessageImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => navigateImages('prev')}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-70 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => navigateImages('next')}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-70 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-center space-x-4">
                            <button
                                onClick={() => downloadImage(modalImage)}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Download
                            </button>
                            <button
                                onClick={() => {
                                    insertImageIntoEditor(modalImage);
                                    closeImageModal();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Insert into Editor
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {isOpen && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="fixed right-0 top-0 h-screen max-w-96 bg-white shadow-lg border-l"
                >
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">
                                {chatMode === 'ai-chat' ? 'Content Generator' : 'Comic Generator'}
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex border-b">
                            <button
                                onClick={() => switchMode('ai-chat')}
                                className={`flex-1 py-2 px-4 text-center ${
                                    chatMode === 'ai-chat' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'
                                }`}
                            >
                                AI Chat
                            </button>
                            <button
                                onClick={() => switchMode('comic-generator')}
                                className={`flex-1 py-2 px-4 text-center ${
                                    chatMode === 'comic-generator' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'
                                }`}
                            >
                                Comic Generator
                            </button>
                        </div>

                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                                        }`}
                                    >
                                        {renderMessage(message)}
                                    </div>
                                </div>
                            ))}
                            {isGenerating && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-lg p-3">
                                        <div className="animate-pulse">Generating...</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t">
                            <div className="flex flex-col w-full relative">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            // Only show suggestions when user has started typing
                                            setShowPromptSuggestions(e.target.value.length > 0);
                                        }}
                                        onFocus={() => {
                                            // Show suggestions when input is focused and not empty
                                            if (input.length > 0) {
                                                setShowPromptSuggestions(true);
                                            }
                                        }}
                                        onBlur={() => {
                                            // Hide suggestions with a slight delay to allow for clicks
                                            setTimeout(() => setShowPromptSuggestions(false), 200);
                                        }}
                                        placeholder={
                                            chatMode === 'ai-chat'
                                                ? 'Describe the content you need...'
                                                : 'Enter your story idea for a comic...'
                                        }
                                        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isGenerating || isGeneratingImage}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isGenerating || isGeneratingImage}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                    >
                                        {chatMode === 'ai-chat' ? 'Generate' : 'Create Comic'}
                                    </button>
                                </div>

                                {/* Filtered suggestions when typing - positioned above input */}
                                {showPromptSuggestions && input.length > 0 && (
                                    <div className="absolute bottom-full mb-2 left-0 right-0 mx-4 bg-white border rounded-md shadow-lg p-2 z-10">
                                        <div className="text-sm text-gray-500 font-medium mb-2">
                                            Need help getting started? Try these prompts...
                                        </div>
                                        {(chatMode === 'ai-chat' ? aiChatPromptSuggestions : comicGeneratorPromptSuggestions)
                                            .filter((suggestion) => suggestion.toLowerCase().includes(input.toLowerCase()))
                                            .slice(0, 3)
                                            .map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSelectPromptSuggestion(suggestion)}
                                                    className="p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors mb-1 last:mb-0"
                                                >
                                                    {suggestion}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIChat;
