import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { summarizeText } from '@/lib/gemini';
import { genAI } from '@/lib/geminiInstance';
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation

interface ContentSummarizerProps {
    editor: Editor | null;
    isVisible: boolean;
    onClose: () => void;
}

export default function ContentSummarizer({ editor, isVisible, onClose }: ContentSummarizerProps) {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible && editor) {
            generateSummary();
        }
    }, [isVisible, editor]);

    const generateSummary = async () => {
        if (!editor) return;

        setIsLoading(true);
        setError(null);

        try {
            // Get plain text content from editor
            const textContent = editor.getText();

            if (!textContent || textContent.trim().length === 0) {
                setSummary('This document appears to be empty.');
                setIsLoading(false);
                return;
            }

            // Use Gemini's summarizeText function
            const response = await summarizeText(genAI, textContent);
            setSummary(response.summary);
        } catch (err) {
            console.error('Error generating summary:', err);
            setError('Failed to generate summary. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to download content as PDF
    const downloadAsPDF = (content: string, filename: string) => {
        const doc = new jsPDF();

        // Split content into lines to fit within PDF page width
        const lines = doc.splitTextToSize(content, 180); // 180 is the max width in mm

        // Add content to PDF
        doc.text(lines, 10, 10); // 10, 10 are the starting coordinates (x, y)

        // Save the PDF
        doc.save(filename);
    };

    // Function to handle download of both summarized and unsummarized content
    const handleDownload = () => {
        if (!editor) return;

        // Get unsummarized content
        const unsummarizedContent = editor.getText();

        // Download unsummarized content as PDF
        downloadAsPDF(unsummarizedContent, 'unsummarized_content.pdf');

        // Download summarized content as PDF
        if (summary) {
            downloadAsPDF(summary, 'summarized_content.pdf');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-3/4 max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-xl font-semibold">Content Summary</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-medium mb-4">Document Summary</h3>
                            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">{summary}</div>

                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={generateSummary}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    Regenerate Summary
                                </button>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Download as PDF
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}