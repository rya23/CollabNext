import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { getGeminiSuggestion } from '@/lib/gemini';

interface AutocompleteProps {
    editor: Editor;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ editor }) => {
    const [suggestion, setSuggestion] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const editorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Get a reference to the editor DOM element
        if (editor && editor.view.dom) {
            const editorElement = editor.view.dom.closest('.ProseMirror');
            if (editorElement instanceof HTMLDivElement) {
                editorRef.current = editorElement;
            }
        }
    }, [editor]);

    // Get current text before cursor for context
    const getTextContext = () => {
        const { state } = editor;
        const { doc } = state;
        const { selection } = state;
        const { $from } = selection;

        // Get all text from the document
        const text = doc.textBetween(0, doc.content.size, ' ');
        return text;
    };

    // Generate suggestion based on current text
    const generateSuggestion = async () => {
        if (!editor.isEditable || isGenerating) return;

        const context = getTextContext();
        if (context.trim().length < 5) {
            setSuggestion('');
            setIsVisible(false);
            return;
        }

        setIsGenerating(true);
        setSuggestion('');

        try {
            await getGeminiSuggestion(context, (text) => {
                setSuggestion((current) => current + text);
                setIsVisible(true);
            });
        } catch (error) {
            console.error('Error generating suggestion:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isVisible || !suggestion) return;

            // Tab to accept suggestion
            if (event.key === 'Tab') {
                event.preventDefault();
                editor.commands.insertContent(suggestion);
                setSuggestion('');
                setIsVisible(false);
            }
            // Escape to dismiss suggestion
            else if (event.key === 'Escape') {
                event.preventDefault();
                setSuggestion('');
                setIsVisible(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editor, suggestion, isVisible]);

    // Watch for typing and trigger suggestion after brief pause
    useEffect(() => {
        const handleTyping = () => {
            if (typingTimeout) clearTimeout(typingTimeout);

            const timeout = setTimeout(() => {
                generateSuggestion();
            }, 750); // Delay to avoid too many API calls

            setTypingTimeout(timeout);
        };

        // Get position updates
        const updateHandler = () => {
            if (!editor.isEditable) return;
            handleTyping();
        };

        editor.on('update', updateHandler);

        return () => {
            editor.off('update', updateHandler);
            if (typingTimeout) clearTimeout(typingTimeout);
        };
    }, [editor, typingTimeout]);

    if (!isVisible || !suggestion || !editorRef.current) return null;

    // Position the suggestion at the current cursor position
    const { state } = editor;
    const { selection } = state;
    const coords = editor.view.coordsAtPos(selection.$head.pos);

    // Calculate remaining width within editor
    const editorRect = editorRef.current.getBoundingClientRect();
    const rightEdgeDistance = editorRect.right - coords.left;
    const maxWidth = Math.max(100, rightEdgeDistance - 20); // Minimum width, with some padding

    return (
        <div
            className="ghost-suggestion"
            style={{
                position: 'absolute',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                maxWidth: `${maxWidth}px`,
                color: '#6b7280',
                opacity: 0.8,
                pointerEvents: 'none',
                zIndex: 10,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        >
            {suggestion} <span className="text-xs text-gray-500">(Tab)</span>
        </div>
    );
};

export default Autocomplete;
