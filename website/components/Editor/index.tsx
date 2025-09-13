"use client";

import { useLiveblocksExtension, FloatingToolbar } from "@liveblocks/react-tiptap";
import { useEditor, EditorContent } from "@tiptap/react";
import { useMemo } from "react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Threads } from "./Threads";

export default function Editor() {
    const liveblocks = useLiveblocksExtension();

    const editor = useEditor(
        {
            extensions: [
                liveblocks,
                StarterKit.configure({
                    history: false,
                    heading: {
                        levels: [1, 2, 3],
                    },
                }),
                Highlight,
                Typography,
                TextAlign.configure({
                    types: ["heading", "paragraph"],
                }),
                Link.configure({
                    openOnClick: true,
                }),
                Image.configure({
                    allowBase64: true,
                }),
            ],
            immediatelyRender: false,
        },
        [liveblocks]
    );

    return (
        <div className="max-w-4xl mx-auto p-5">
            <div className="flex gap-2 p-2 mb-4 border-b border-gray-200">
                <button
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                        editor?.isActive("bold") ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"
                    }`}
                >
                    Bold
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                        editor?.isActive("italic") ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"
                    }`}
                >
                    Italic
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                        editor?.isActive("heading", { level: 1 }) ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"
                    }`}
                >
                    H1
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                        editor?.isActive("heading", { level: 2 }) ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"
                    }`}
                >
                    H2
                </button>
                <button
                    onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                        editor?.isActive({ textAlign: "left" }) ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"
                    }`}
                >
                    Left
                </button>
                <button
                    onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                        editor?.isActive({ textAlign: "center" }) ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"
                    }`}
                >
                    Center
                </button>
            </div>

            <EditorContent
                editor={editor}
                className="min-h-[300px] border border-gray-200 rounded-lg p-5 focus:outline-none prose prose-sm max-w-none"
            />
            <Threads editor={editor} />
            <FloatingToolbar editor={editor} />
        </div>
    );
}
