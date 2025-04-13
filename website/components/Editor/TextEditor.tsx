"use client";

import { ClientSideSuspense, useThreads } from "@liveblocks/react/suspense";
import {
  FloatingComposer,
  FloatingThreads,
  useLiveblocksExtension,
  FloatingToolbar,
} from "@liveblocks/react-tiptap";
import Highlight from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorView } from "prosemirror-view";
import { DocumentSpinner } from "@/primitives/Spinner";
import { CustomTaskItem } from "../ui/editor/CustomTaskItem";
import { StaticToolbar, SelectionToolbar } from "../ui/editor/Toolbars";
import styles from "../ui/editor/TextEditor.module.css";
import { Avatars } from "@/components/ui/editor/Avatars";
import React, { useEffect, useState } from "react";
import { useStorage, useMutation, useRoom } from "@/liveblock.config";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { initializeApp } from "firebase/app";
import { Threads } from "./Threads";
import TextSelectionToolbar from "../TextSelectionToolbar";
import AIChat from "../AIChat";
import {
  ChatBubbleLeftIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Autocomplete from "../Autocomplete";
import "@/styles/autocomplete.css";
import StoryAnalysis from "../StoryAnalysis";
import VersionHistory from "./VersionHistory";
import ContentSummarizer from "../ContentSummarizer";
import {
  BotMessageSquare,
  DownloadIcon,
  GitCompareArrows,
  SaveAll,
} from "lucide-react";

// Firebase config - Replace with your own
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only do this once)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // App already initialized
}

interface TextEditorProps {
  fileId: string | null;
}

export default function TextEditor({ fileId }: TextEditorProps) {
  return (
    <ClientSideSuspense fallback={<DocumentSpinner />}>
      {() => <EditorWithStorage fileId={fileId} />}
    </ClientSideSuspense>
  );
}

interface Version {
  id: string;
  content: string;
  createdAt: Timestamp;
  name: string;
}

function EditorWithStorage({ fileId }: TextEditorProps) {
  const [localContent, setLocalContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionName, setVersionName] = useState("");
  const [createVersionDialogOpen, setCreateVersionDialogOpen] = useState(false);
  const [showSummarizer, setShowSummarizer] = useState(false);

  const params = useParams();
  const fileIdFromParams =
    typeof params?.fileId === "string" ? params.fileId : "";
  const currentFileId = fileId || fileIdFromParams;

  const room = useRoom();
  const db = getFirestore();

  // Use a separate hook to check if storage has been initialized yet
  const hasStorage = !!useStorage((root) => root);

  // Access content from storage properly with a selector function
  const storageContent = useStorage((root) => root.content);

  // Initialize storage only when needed
  const initStorage = useMutation(({ storage }, content) => {
    if (!storage.has("content")) {
      storage.set("content", content);
      setStorageInitialized(true);
    }
  }, []);

  // Update storage
  const updateStorage = useMutation(({ storage }, content) => {
    storage.set("content", content);
  }, []);

  // Load versions from Firebase
  const loadVersions = async () => {
    if (!currentFileId) return;

    try {
      const versionsRef = collection(db, "files", currentFileId, "versions");
      const q = query(versionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const loadedVersions: Version[] = [];
      querySnapshot.forEach((doc) => {
        loadedVersions.push({
          id: doc.id,
          ...doc.data(),
        } as Version);
      });

      setVersions(loadedVersions);
    } catch (error) {
      console.error("Error loading versions:", error);
    }
  };

  // Create a new version
  const createVersion = async () => {
    // Get content directly from editor if available (most reliable source)
    const contentToSave = editor ? editor.getHTML() : localContent;

    console.log("Creating version with content length:", contentToSave?.length);
    console.log("Current file ID:", currentFileId);

    if (!currentFileId) {
      console.error("Missing file ID - cannot save version");
      return;
    }

    if (!contentToSave) {
      console.error("Missing content - cannot save empty version");
      return;
    }

    try {
      setIsSaving(true);
      const versionsRef = collection(db, "files", currentFileId, "versions");

      await addDoc(versionsRef, {
        content: contentToSave,
        createdAt: Timestamp.now(),
        name: versionName || `Version ${new Date().toLocaleString()}`,
      });

      console.log("Version saved successfully");
      setVersionName("");
      setCreateVersionDialogOpen(false);
      loadVersions();
    } catch (error) {
      console.error("Error creating version:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Restore a previous version
  const restoreVersion = (version: Version) => {
    if (editor) {
      editor.commands.setContent(version.content);
      handleContentChange(version.content);
    }
  };

  useEffect(() => {
    if (showVersionHistory) {
      loadVersions();
    }
  }, [showVersionHistory, currentFileId]);

  // First, load content from Firebase
  useEffect(() => {
    if (!currentFileId) {
      setFirebaseLoaded(true);
      setIsLoading(false);
      return;
    }

    async function loadFromFirebase() {
      try {
        setIsLoading(true);
        console.log("Loading content from Firebase for file:", currentFileId);
        const fileRef = doc(db, "files", currentFileId);
        const fileDoc = await getDoc(fileRef);

        if (fileDoc.exists()) {
          const fileData = fileDoc.data();
          console.log(
            "Firebase content loaded, length:",
            fileData.content?.length
          );
          setLocalContent(fileData.content || "");
        } else {
          console.log("File document does not exist in Firebase");
          setLocalContent("");
        }
      } catch (error) {
        console.error("Error loading from Firebase:", error);
      } finally {
        setFirebaseLoaded(true);
        setIsLoading(false);
      }
    }

    loadFromFirebase();
  }, [currentFileId, db]);

  // When storage becomes available and we have Firebase content, initialize storage
  useEffect(() => {
    // Only initialize if Firebase is loaded, storage exists, and we haven't initialized yet
    if (firebaseLoaded && hasStorage && !storageInitialized) {
      // If storage content is undefined (not set yet), initialize it with our local content
      if (storageContent === undefined) {
        initStorage(localContent);
      } else {
        // Storage already has content - update our local state
        setLocalContent(storageContent);
      }
    }
  }, [
    firebaseLoaded,
    hasStorage,
    storageContent,
    localContent,
    initStorage,
    storageInitialized,
  ]);

  // When storage content changes, update our local state
  useEffect(() => {
    if (storageContent !== undefined && storageContent !== null) {
      setLocalContent(storageContent);
    }
  }, [storageContent]);

  // Save to Firebase periodically
  useEffect(() => {
    if (!localContent || !currentFileId) return;

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        const fileRef = doc(db, "files", currentFileId);

        await setDoc(
          fileRef,
          {
            content: localContent,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving to Firebase:", error);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    setSaveTimeout(timeout);

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [localContent, currentFileId, db]);

  // Handle content changes from the editor
  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);

    // Only update storage if it's initialized
    if (hasStorage && storageInitialized) {
      updateStorage(newContent);
    }
  };

  // Set up Tiptap editor
  const liveblocks = useLiveblocksExtension();

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    extensions: [
      liveblocks,
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: "tiptap-blockquote",
          },
        },
        code: {
          HTMLAttributes: {
            class: "tiptap-code",
          },
        },
        codeBlock: {
          languageClassPrefix: "language-",
          HTMLAttributes: {
            class: "tiptap-code-block",
            spellcheck: false,
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "tiptap-heading",
          },
        },
        history: false,
        horizontalRule: {
          HTMLAttributes: {
            class: "tiptap-hr",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "tiptap-list-item",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "tiptap-ordered-list",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "tiptap-paragraph",
          },
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "tiptap-highlight",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: "tiptap-link",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing…",
        emptyEditorClass: "tiptap-empty",
      }),
      CustomTaskItem,
      TaskList.configure({
        HTMLAttributes: {
          class: "tiptap-task-list",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Typography,
      Youtube.configure({
        modestBranding: true,
        HTMLAttributes: {
          class: "tiptap-youtube",
        },
      }),
    ],
    content: localContent || "<p></p>", // Ensure we always have valid HTML content
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      console.log("Editor updated, content length:", newContent.length);
      handleContentChange(newContent);
    },
  });

  // Update editor content when our local content changes
  useEffect(() => {
    if (editor && localContent && editor.getHTML() !== localContent) {
      console.log(
        "Updating editor with local content, length:",
        localContent.length
      );
      editor.commands.setContent(localContent);
    }
  }, [editor, localContent]);

  const { threads } = useThreads();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const toggleAIChat = () => {
    setIsAIChatOpen(!isAIChatOpen);
  };

  const toggleVersionHistory = () => {
    setShowVersionHistory(!showVersionHistory);
  };

  const toggleSummarizer = () => {
    setShowSummarizer(!showSummarizer);
  };

  const downloadEditorContentAlternative = async () => {
    if (!editor) return;

    try {
      // Get the editor DOM element
      const editorElement = document.querySelector(
        ".ProseMirror"
      ) as HTMLElement;
      if (!editorElement) {
        throw new Error("Could not find editor element");
      }

      // Dynamic imports
      const [{ default: domtoimage }, { default: jsPDF }] = await Promise.all([
        import("dom-to-image"),
        import("jspdf"),
      ]);

      // First create an image of the editor content
      const dataUrl = await domtoimage.toPng(editorElement, {
        quality: 0.95,
        bgcolor: "#ffffff",
      });

      // Create PDF with correct dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm

      const pdf = new jsPDF("p", "mm", "a4");

      // Calculate height based on aspect ratio
      const imgHeight =
        (editorElement.offsetHeight * imgWidth) / editorElement.offsetWidth;

      // Add the image to the PDF
      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);

      // If content is taller than one page, add more pages
      if (imgHeight > pageHeight) {
        let heightLeft = imgHeight - pageHeight;
        let position = -pageHeight;

        while (heightLeft > 0) {
          position = position - pageHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      // Save the PDF
      pdf.save(`document-${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-full">
        <div className={styles.container}>
          <div className={styles.editorHeader}>
            <div className="flex items-center space-x-6 w-full">
              <div className="flex-1">
                <StaticToolbar editor={editor} />
              </div>

              <div className="flex items-center gap-4 px-4">
                <button
                  onClick={toggleAIChat}
                  className="p-2.5 rounded-lg hover:bg-secondary/80 transition-colors border border-border"
                  title="AI Content Generator"
                >
                  <BotMessageSquare className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={toggleVersionHistory}
                  className="p-2.5 rounded-lg hover:bg-secondary/80 transition-colors border border-border"
                  title="Version History"
                >
                  <GitCompareArrows className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={toggleSummarizer}
                  className="p-2.5 rounded-lg hover:bg-secondary/80 transition-colors border border-border"
                  title="Summarize Content"
                >
                  <DocumentTextIcon className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={downloadEditorContentAlternative}
                  className="p-2.5 rounded-lg hover:bg-secondary/80 transition-colors border border-border"
                  title="Download as PDF"
                >
                  <DownloadIcon className="w-5 h-5 text-foreground" />
                </button>

                <div className="h-6 w-[1px] bg-border mx-2"></div>

                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors border border-border"
                  title="Story Analysis"
                >
                  <span className="text-foreground text-sm">Analysis</span>
                </button>
                <button
                  onClick={() => setCreateVersionDialogOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <SaveAll className="w-4 h-4 mr-1" />
                </button>
              </div>

              <div className="pl-4 border-l border-border">
                <Avatars />
              </div>
            </div>
          </div>
          <div className={styles.editorPanel}>
            <EditorContent editor={editor} className={styles.editorContainer} />
            <FloatingComposer editor={editor} style={{ width: 350 }} />
            <FloatingThreads threads={threads} editor={editor} />
            {editor && <TextSelectionToolbar editor={editor} />}
            {editor && (
              <AIChat
                editor={editor}
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
              />
            )}
            {editor && <Autocomplete editor={editor} />}
            {editor && (
              <StoryAnalysis
                editor={editor}
                isVisible={showAnalysis}
                onClose={() => setShowAnalysis(false)}
              />
            )}
          </div>
        </div>
      </div>
      {isSaving && (
        <div className="py-1 px-3 text-xs text-white/50 bg-[#111111] border-t border-[#1F1F1F]">
          Saving...
        </div>
      )}

      {/* Version History Panel */}
      {editor && (
        <VersionHistory
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          versions={versions}
          onRestore={restoreVersion}
          currentContent={localContent}
        />
      )}

            {/* Create Version Dialog */}
            {createVersionDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Save Version</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Version Name</label>
                            <input
                                type="text"
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                placeholder="Enter a name for this version"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setCreateVersionDialogOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createVersion}
                                className="px-4 py-2 bg-[#a0a263] text-white rounded hover:bg-[#808203]"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

      {/* Add the ContentSummarizer component */}
      {editor && (
        <ContentSummarizer
          editor={editor}
          isVisible={showSummarizer}
          onClose={() => setShowSummarizer(false)}
        />
      )}
    </div>
  );
}

// Prevents a matchesNode error on hot reloading
EditorView.prototype.updateState = function updateState(state) {
  // @ts-ignore
  if (!this.docView) return;
  // @ts-ignore
  this.updateStateInner(state, this.state.plugins != state.plugins);
};
