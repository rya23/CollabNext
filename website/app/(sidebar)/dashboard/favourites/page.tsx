"use client";

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { motion } from "framer-motion";
import { Folder, Clock, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { getSession } from "@/app/actions/auth";

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

interface Project {
  id: string;
  title: string;
  lastModified: string;
  documentsCount: number;
  progress: number;
  members: number;
}

export default function FavoritesPage() {
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSession();

        if (session?.user) {
          setUserName(session.user.name || null);
          // Use email as the user ID for Firebase when NextAuth ID is not available
          const userId = session.user.id || session.user.email;
          if (userId) {
            fetchFavorites(userId);
          }
        } else {
          setIsLoading(false);
          toast({
            title: "Authentication required",
            description: "Please sign in to view your favorites",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsLoading(false);
        toast({
          title: "Authentication error",
          description: "Could not verify your identity",
          variant: "destructive",
        });
      }
    }

    checkAuth();
  }, [toast]);

  const fetchFavorites = async (userId: string) => {
    try {
      setIsLoading(true);
      const favoritesRef = collection(db, "userFavorites");
      const q = query(favoritesRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      // Get list of favorite project IDs
      const favoriteIds = snapshot.docs.map((doc) => doc.data().projectId);

      // Fetch actual project data for each ID
      const projectsData: Project[] = [];
      for (const projectId of favoriteIds) {
        const projectRef = await getDoc(doc(db, "projects", projectId));
        if (projectRef.exists()) {
          const data = projectRef.data();
          projectsData.push({
            id: projectId,
            title: data.title,
            lastModified: data.updatedAt
              ? new Date(data.updatedAt.seconds * 1000).toLocaleDateString()
              : "N/A",
            documentsCount: data.documentsCount || 0,
            progress: data.progress || 0,
            members: data.members || 1,
          });
        }
      }

      setFavoriteProjects(projectsData);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error loading favorites",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-900">
      <Toaster />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {userName ? `${userName}'s Favorites` : "Favorite Projects"}
        </h1>
        <p className="text-gray-400">
          Your most important projects in one place
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="rounded-xl bg-gray-800 border border-gray-700 animate-pulse p-6 h-52"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 rounded-lg bg-gray-700 h-12 w-12"></div>
                  <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-700 rounded mb-6"></div>
                <div className="h-2 w-full bg-gray-700 rounded-full"></div>
              </div>
            ))
        ) : favoriteProjects.length > 0 ? (
          favoriteProjects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => router.push(`/dashboard/project/${project.id}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all" />

              <div className="relative p-6 rounded-xl bg-gray-800 border border-gray-700 group-hover:border-gray-600 transition-all">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-gray-700 group-hover:bg-gray-600 transition-colors">
                    <Folder className="h-6 w-6 text-amber-400" />
                  </div>
                  <Heart className="h-6 w-6 fill-red-500 text-red-500 drop-shadow-glow" />
                </div>

                <h3 className="text-lg font-semibold text-white mt-4 group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {project.lastModified}
                  </span>
                  <span>{project.documentsCount} docs</span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center rounded-xl bg-gray-800 border border-gray-700">
            <Heart className="h-16 w-16 mx-auto mb-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-white mb-4">
              No favorites yet
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Add projects to your favorites by clicking the heart icon on any
              project in your dashboard.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}