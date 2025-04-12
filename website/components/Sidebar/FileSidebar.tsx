"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Plus,
  MoreVertical,
  FilePlus,
  FolderPlus,
  Trash2,
  Edit,
  FileText,
  FileCode,
  FileImage,
  FilePen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Firebase config - Replace with your own
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

interface FileItem {
  id: string;
  name: string;
  type: string;
  content?: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  isOpen: boolean;
}

type FileType = "text" | "code" | "markdown" | "script";

interface FileSidebarProps {
  onFileSelect: (fileId: string) => void;
  onCreateSuccess: (fileId: string, fileName: string) => void;
  activeFileId: string | null;
}

const FILE_ICONS = {
  text: <FileText size={16} />,
  code: <FileCode size={16} />,
  markdown: <FilePen size={16} />,
  script: <FileImage size={16} />,
};

export default function FileSidebar({
  onFileSelect,
  onCreateSuccess,
  activeFileId,
}: FileSidebarProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileType, setNewFileType] = useState<FileType>("text");
  const [selectedParentFolder, setSelectedParentFolder] = useState<
    string | null
  >(null);
  const [itemToRename, setItemToRename] = useState<{
    id: string;
    type: "file" | "folder";
    name: string;
  } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch files and folders on mount
  useEffect(() => {
    fetchFilesAndFolders();
  }, []);

  const fetchFilesAndFolders = async () => {
    try {
      setIsLoading(true);

      // Fetch folders
      const foldersSnapshot = await getDocs(collection(db, "folders"));
      const foldersData: FolderItem[] = [];

      foldersSnapshot.forEach((doc) => {
        const folderData = doc.data() as Omit<FolderItem, "id" | "isOpen">;
        foldersData.push({
          ...folderData,
          id: doc.id,
          isOpen: false,
        });
      });

      setFolders(foldersData);

      // Fetch files
      const filesSnapshot = await getDocs(collection(db, "files"));
      const filesData: FileItem[] = [];

      filesSnapshot.forEach((doc) => {
        const fileData = doc.data() as Omit<FileItem, "id">;
        filesData.push({
          ...fileData,
          id: doc.id,
        });
      });

      setFiles(filesData);
    } catch (error) {
      console.error("Error fetching files and folders:", error);
      toast("Failed to load files and folders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      toast("Please enter a file name");
      return;
    }

    try {
      setIsLoading(true);

      const fileId = uuidv4();
      const newFile: FileItem = {
        id: fileId,
        name: newFileName,
        type: newFileType,
        parentId: selectedParentFolder,
        content: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save to Firebase
      await setDoc(doc(db, "files", fileId), newFile);

      // Update local state
      setFiles([...files, newFile]);

      // Reset form
      setNewFileName("");
      setSelectedParentFolder(null);
      setIsCreateFileOpen(false);

      // Notify parent component
      onCreateSuccess(fileId, newFileName);
    } catch (error) {
      console.error("Error creating file:", error);
      toast("Failed to create file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast("Please enter a folder name");
      return;
    }

    try {
      setIsLoading(true);

      const folderId = uuidv4();
      const newFolder: Omit<FolderItem, "isOpen"> = {
        id: folderId,
        name: newFolderName,
        parentId: selectedParentFolder,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save to Firebase
      await setDoc(doc(db, "folders", folderId), newFolder);

      // Update local state
      setFolders([...folders, { ...newFolder, isOpen: false }]);

      // Reset form
      setNewFolderName("");
      setSelectedParentFolder(null);
      setIsCreateFolderOpen(false);

      toast(`Folder "${newFolderName}" created successfully`);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast("Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameItem = async () => {
    if (!itemToRename || !newItemName.trim()) {
      toast("Please enter a name");
      return;
    }

    try {
      setIsLoading(true);

      const { id, type } = itemToRename;
      const collectionName = type === "file" ? "files" : "folders";

      // Update in Firebase
      await updateDoc(doc(db, collectionName, id), {
        name: newItemName,
        updatedAt: Date.now(),
      });

      // Update local state
      if (type === "file") {
        setFiles(
          files.map((file) =>
            file.id === id
              ? { ...file, name: newItemName, updatedAt: Date.now() }
              : file
          )
        );
      } else {
        setFolders(
          folders.map((folder) =>
            folder.id === id
              ? { ...folder, name: newItemName, updatedAt: Date.now() }
              : folder
          )
        );
      }

      // Reset form
      setItemToRename(null);
      setNewItemName("");
      setIsRenameOpen(false);

      toast(`${type === "file" ? "File" : "Folder"} renamed successfully`);
    } catch (error) {
      console.error("Error renaming item:", error);
      toast(`Failed to rename ${itemToRename.type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, type: "file" | "folder") => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      setIsLoading(true);

      const collectionName = type === "file" ? "files" : "folders";

      // Delete from Firebase
      await deleteDoc(doc(db, collectionName, id));

      // If folder, also delete all child files and folders
      if (type === "folder") {
        // Delete child files
        const childFilesQuery = query(
          collection(db, "files"),
          where("parentId", "==", id)
        );
        const childFilesSnapshot = await getDocs(childFilesQuery);

        const deleteFilePromises = childFilesSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deleteFilePromises);

        // Delete child folders (recursive function would be better for deep nesting)
        const childFoldersQuery = query(
          collection(db, "folders"),
          where("parentId", "==", id)
        );
        const childFoldersSnapshot = await getDocs(childFoldersQuery);

        const deleteFolderPromises = childFoldersSnapshot.docs.map(
          async (folderDoc) => {
            // Recursively delete this folder
            await handleDeleteItem(folderDoc.id, "folder");
          }
        );

        await Promise.all(deleteFolderPromises);
      }

      // Update local state
      if (type === "file") {
        setFiles(files.filter((file) => file.id !== id));
      } else {
        setFolders(folders.filter((folder) => folder.id !== id));
        // Also filter out any files that were in this folder
        setFiles(files.filter((file) => file.parentId !== id));
      }

      toast(`${type === "file" ? "File" : "Folder"} deleted successfully`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast(`Failed to delete ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolderOpen = (folderId: string) => {
    setFolders(
      folders.map((folder) =>
        folder.id === folderId ? { ...folder, isOpen: !folder.isOpen } : folder
      )
    );
  };

  // Get children for a specific parent ID
  const getChildFolders = (parentId: string | null) => {
    return folders.filter((folder) => folder.parentId === parentId);
  };

  const getChildFiles = (parentId: string | null) => {
    return files.filter((file) => file.parentId === parentId);
  };

  // Recursive component to render the file tree
  const renderTree = (parentId: string | null, level: number = 0) => {
    const childFolders = getChildFolders(parentId);
    const childFiles = getChildFiles(parentId);

    return (
      <>
        {childFolders.map((folder) => (
          <div key={folder.id}>
            <div
              className={cn(
                "flex items-center py-1 px-2 text-white/80 hover:bg-white/5 rounded transition-colors cursor-pointer",
                `pl-${level * 4 + 2}`
              )}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              <button
                className="mr-1 focus:outline-none"
                onClick={() => toggleFolderOpen(folder.id)}
              >
                {folder.isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              <Folder size={16} className="mr-2 text-yellow-500" />
              <span className="flex-1 truncate">{folder.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical size={14} className="text-white/50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white/80"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setItemToRename({
                        id: folder.id,
                        type: "folder",
                        name: folder.name,
                      });
                      setNewItemName(folder.name);
                      setIsRenameOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Edit size={14} className="mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteItem(folder.id, "folder")}
                    className="cursor-pointer text-red-400"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {folder.isOpen && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTree(folder.id, level + 1)}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        ))}
        {childFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex items-center py-1 px-2 rounded transition-colors cursor-pointer",
              activeFileId === file.id
                ? "bg-purple-900/20 text-white"
                : "text-white/80 hover:bg-white/5",
              `pl-${level * 4 + 6}`
            )}
            style={{ paddingLeft: `${level * 12 + 28}px` }}
            onClick={() => onFileSelect(file.id)}
          >
            {FILE_ICONS[file.type as keyof typeof FILE_ICONS] || (
              <File size={16} />
            )}
            <span className="ml-2 flex-1 truncate">{file.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical size={14} className="text-white/50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white/80"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToRename({
                      id: file.id,
                      type: "file",
                      name: file.name,
                    });
                    setNewItemName(file.name);
                    setIsRenameOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Edit size={14} className="mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(file.id, "file");
                  }}
                  className="cursor-pointer text-red-400"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-[#1F1F1F]">
        <h2 className="font-medium text-white">Explorer</h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setIsCreateFileOpen(true)}
          >
            <FilePlus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <FolderPlus size={16} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {isLoading && files.length === 0 && folders.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          ) : files.length === 0 && folders.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-white/50 text-sm">No files or folders yet</p>
              <p className="text-white/30 text-xs mt-1">
                Create a new file or folder to get started
              </p>
            </div>
          ) : (
            renderTree(null)
          )}
        </div>
      </ScrollArea>

      {/* Create File Dialog */}
      <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileName" className="text-right">
                Name
              </Label>
              <Input
                id="fileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Untitled"
                className="col-span-3 bg-[#1A1A1A] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileType" className="text-right">
                Type
              </Label>
              <Select
                onValueChange={(value) => setNewFileType(value as FileType)}
                defaultValue="text"
              >
                <SelectTrigger className="col-span-3 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectItem value="text">Text Document</SelectItem>
                  <SelectItem value="code">Code File</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                Location
              </Label>
              <Select
                onValueChange={(value) =>
                  setSelectedParentFolder(value === "root" ? null : value)
                }
                defaultValue="root"
              >
                <SelectTrigger className="col-span-3 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectValue placeholder="Root" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white max-h-[200px]">
                  <SelectItem value="root">Root</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateFileOpen(false)}
              className="border-[#2A2A2A] text-white bg-[#1A1A1A]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFile}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">
                Name
              </Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New Folder"
                className="col-span-3 bg-[#1A1A1A] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                Location
              </Label>
              <Select
                onValueChange={(value) =>
                  setSelectedParentFolder(value === "root" ? null : value)
                }
                defaultValue="root"
              >
                <SelectTrigger className="col-span-3 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectValue placeholder="Root" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white max-h-[200px]">
                  <SelectItem value="root">Root</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateFolderOpen(false)}
              className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Rename {itemToRename?.type === "file" ? "File" : "Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newName" className="text-right">
                New name
              </Label>
              <Input
                id="newName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="col-span-3 bg-[#1A1A1A] border-[#2A2A2A] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              className="border-[#2A2A2A] text-white bg-[#2A2A2A]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameItem}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Renaming...
                </div>
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
