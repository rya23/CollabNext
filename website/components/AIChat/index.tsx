import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@tiptap/core";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubbleLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { generateFileContent, FileGenerationResponse } from "@/lib/gemini";
import { genAI } from "@/lib/geminiInstance";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";

interface AIChatProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  autoConvertMarkdown?: boolean;
}
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
}

const AIChat: React.FC<AIChatProps> = ({
  editor,
  isOpen,
  onClose,
  autoConvertMarkdown = true,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you generate code or content. What would you like to create?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      console.error("Error generating response:", error);
      return {
        content: "Sorry, I encountered an error while generating the content.",
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
      console.error("Error converting markdown to HTML:", error);
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
      console.error("Error inserting content:", error);
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
      console.error("Error inserting markdown:", error);
      // Fallback to inserting plain text
      editor.chain().focus().insertContent(markdown).run();
    }
  };

  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return <p className="text-white">{message.content}</p>;
    }

    return message.generatedContent ? (
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
    ) : (
      <p>{message.content}</p>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed right-0 top-0 h-screen max-w-96 bg-white shadow-lg border-l"
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Content Generator</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100"
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
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the content you need..."
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;
