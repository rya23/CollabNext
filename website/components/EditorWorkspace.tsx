"use client";
import React, { useState, useEffect } from "react";
import { Room } from "@/app/Room";
import { usePathname, useRouter } from "next/navigation";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { toast } from "sonner";
import FileSidebar from "@/components/Sidebar/FileSidebar";
import TextEditor from "@/components/Editor/TextEditor";

export default function EditorWorkspace() {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Set active file based on URL params if available
  useEffect(() => {
    // Extract file ID from URL if present
    const fileIdMatch = pathname.match(/\/file\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      setActiveFileId(fileIdMatch[1]);
      setActiveRoomId(`file-${fileIdMatch[1]}`);
    }
  }, [pathname]);

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
    setActiveRoomId(`file-${fileId}`);
    router.push(`/create/file/${fileId}`);
  };

  const handleCreateSuccess = (fileId: string, fileName: string) => {
    toast(`${fileName} has been created successfully`, {
      description: "You can now start editing the file.",
    });
    handleFileSelect(fileId);
  };

  return (
    <div className="h-[100vh] flex flex-col">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className="bg-[#0F0F0F] border-r border-[#1F1F1F]"
        >
          <FileSidebar
            onFileSelect={handleFileSelect}
            onCreateSuccess={handleCreateSuccess}
            activeFileId={activeFileId}
          />
        </ResizablePanel>
        <ResizablePanel defaultSize={80}>
          {activeRoomId ? (
            <Room roomId={activeRoomId}>
              <TextEditor fileId={activeFileId} />
            </Room>
          ) : (
            <div className="flex items-center justify-center h-full bg-[#0A0A0A] text-white/70">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">
                  No document selected
                </h3>
                <p className="text-white/50">
                  Create or select a document from the sidebar to start editing
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
