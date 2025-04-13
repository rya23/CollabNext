'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    FileText,
    Plus,
    File,
    FileCheck,
    Calendar,
    User,
    Clock,
    Star,
    Search,
    Settings,
    Share2,
    MoreVertical,
    ChevronRight,
    Layout,
    Sparkles,
    Heart,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import DocumentCard from '@/components/DocumentCard';
import ShareDialog from '@/components/ShareDialog';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    query,
    where,
    getDocs,
    setDoc,
    updateDoc,
    serverTimestamp,
    orderBy,
    limit,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getSession } from '@/app/actions/auth';
import Link from 'next/link';

// Firebase config
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
const db = getFirestore(app);

// Document templates
const templates = [
    {
        id: 1,
        title: 'Modern Resume',
        description: 'Stand out with this professional template',
        icon: FileText,
        color: 'from-blue-500 to-indigo-500',
    },
    {
        id: 2,
        title: 'Project Proposal',
        description: 'Win clients with this proposal template',
        icon: FileCheck,
        color: 'from-purple-500 to-pink-500',
    },
    {
        id: 3,
        title: 'Business Report',
        description: 'Comprehensive report with analytics',
        icon: File,
        color: 'from-emerald-500 to-teal-500',
    },
];

export default function DocumentManager() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const projectId = params?.id as string;

    const [isCreatingDoc, setIsCreatingDoc] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [projectData, setProjectData] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Fetch user data
    useEffect(() => {
        async function checkAuth() {
            try {
                const session = await getSession();

                if (session?.user) {
                    // Handle possible undefined values with nullish coalescing
                    setUserId(session.user.id || session.user.email || null);
                    setUserName(session.user.name || null);
                    setUserEmail(session.user.email || null);
                }
            } catch (error) {
                console.error('Auth error:', error);
            }
        }

        checkAuth();
    }, []);

    // Fetch project data
    useEffect(() => {
        async function fetchProjectData() {
            try {
                setIsLoading(true);
                const projectRef = doc(db, 'projects', projectId);
                const projectSnap = await getDoc(projectRef);

                if (projectSnap.exists()) {
                    setProjectData(projectSnap.data());
                } else {
                    toast({
                        title: 'Project not found',
                        description: "The requested project doesn't exist",
                        // variant: "destructive",
                    });
                }
            } catch (error) {
                console.error('Error fetching project:', error);
                toast({
                    title: 'Error loading project',
                    description: 'Please try again later',
                    // variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        if (projectId) {
            fetchProjectData();
        }
    }, [projectId, toast]);

    // Fetch project documents
    useEffect(() => {
        async function fetchDocuments() {
            try {
                setIsLoading(true);
                const documentsRef = collection(db, 'documents');
                const q = query(
                    documentsRef,
                    where('projectId', '==', projectId),
                    where('createdBy', '==', userId),
                    orderBy('updatedAt', 'desc'),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                const documentsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setDocuments(documentsData);
                setFilteredDocuments(documentsData);
            } catch (error) {
                console.error('Error fetching documents:', error);
                toast({
                    title: 'Error loading documents',
                    description: 'Please try again later',
                    // variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        if (projectId && userId) {
            fetchDocuments();
        }
    }, [projectId, userId, toast]);

    // Filter documents based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredDocuments(documents);
        } else {
            const filtered = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredDocuments(filtered);
        }
    }, [searchQuery, documents]);

    const handleCreateDocument = async () => {
        if (!newDocTitle.trim()) {
            toast({
                title: 'Title required',
                description: 'Please enter a document title',
                // variant: "destructive",
            });
            return;
        }

        // if (!userId) {
        //   toast({
        //     title: "Authentication required",
        //     description: "Please sign in to create documents",
        //     variant: "destructive",
        //   });
        //   return;
        // }

        try {
            setIsLoading(true);

            // Create new document in Firestore
            const newDocRef = doc(collection(db, 'documents'));
            const newDocument = {
                id: newDocRef.id,
                title: newDocTitle,
                content: '',
                projectId: projectId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userId,
                authorName: userName || 'Anonymous User',
                authorEmail: userEmail,
                status: 'Draft',
                progress: 0,
            };

            await setDoc(newDocRef, newDocument);

            // Update project document count
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                documentsCount: (projectData.documentsCount || 0) + 1,
                updatedAt: serverTimestamp(),
            });

            // Update local state
            setDocuments((prev) => [newDocument, ...prev]);
            setFilteredDocuments((prev) => [newDocument, ...prev]);

            // Reset form state
            setNewDocTitle('');
            setIsCreatingDoc(false);

            // Navigate to the new document
            router.push(`/create/file/${newDocRef.id}`);

            toast({
                title: 'Document created',
                description: 'Your new document has been created successfully',
            });
        } catch (error) {
            console.error('Error creating document:', error);
            toast({
                title: 'Error creating document',
                description: 'Please try again later',
                // variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            <Toaster />

            {/* Glassmorphism Header */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
                        >
                            <Layout className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-xl font-bold text-white">{projectData?.title || 'Project Documents'}</h1>
                            <p className="text-sm text-gray-400">Manage your project files</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            onClick={() => setIsShareDialogOpen(true)}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-8">
                {/* Search and Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 focus:border-blue-500"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreatingDoc(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        New Document
                    </motion.button>
                </div>

                {/* Templates Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                            Featured Templates
                        </h2>
                        <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            View all templates
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="relative group cursor-pointer"
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                {/* Gradient Background */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-10 rounded-xl group-hover:opacity-20 transition-opacity`}
                                />

                                {/* Content */}
                                <div className="relative p-6 rounded-xl bg-gray-800 border border-gray-700 group-hover:border-gray-600 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${template.color}`}>
                                            <template.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                {template.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                        </div>
                                    </div>

                                    {/* Hover State Button */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`p-2 rounded-lg bg-gradient-to-r ${template.color} text-white shadow-lg`}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Documents */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        Recent Documents
                    </h2>
                    <div className="grid gap-4">
                        {isLoading ? (
                            // Loading skeletons
                            Array(3)
                                .fill(0)
                                .map((_, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-gray-800 border border-gray-700 animate-pulse">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-gray-700 h-9 w-9"></div>
                                                <div>
                                                    <div className="h-5 w-48 bg-gray-700 rounded mb-2"></div>
                                                    <div className="h-3 w-32 bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden md:block w-32 h-2 bg-gray-700 rounded-full"></div>
                                                <div className="w-20 h-6 bg-gray-700 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    id={doc.id}
                                    title={doc.title}
                                    lastModified={
                                        doc.updatedAt ? new Date(doc.updatedAt.seconds * 1000).toLocaleDateString() : 'Recent'
                                    }
                                    author={doc.authorName || 'Unknown'}
                                    status={doc.status || 'Draft'}
                                    progress={doc.progress || 0}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center rounded-xl bg-gray-800 border border-gray-700">
                                <FileText className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
                                <p className="text-gray-400 mb-6">
                                    {searchQuery ? 'Try a different search term' : 'Create your first document to get started'}
                                </p>
                                <Link href="/create">
                                    <button
                                        onClick={() => {}}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                                    >
                                        Create a Document
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Document Modal */}
            <AnimatePresence>
                {isCreatingDoc && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-700"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-white">Create New Document</h3>
                                <button className="text-gray-400 hover:text-gray-300 transition-colors">
                                    <Plus className="h-6 w-6 transform rotate-45" />
                                </button>
                            </div>
                            <Input
                                type="text"
                                placeholder="Document Title"
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 mb-6"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsCreatingDoc(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateDocument}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Creating...' : 'Create Document'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Share Dialog */}
            {projectData && (
                <ShareDialog
                    isOpen={isShareDialogOpen}
                    onClose={() => setIsShareDialogOpen(false)}
                    projectId={projectId}
                    projectTitle={projectData.title}
                />
            )}
        </div>
    );
}
