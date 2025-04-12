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
    <div className="flex flex-col min-h-screen p-6 bg-background">
      <Toaster />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {userName ? `${userName}'s Favorites` : "Favorite Projects"}
        </h1>
        <p className="text-muted-foreground">
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
                className="rounded-xl bg-card border border-border animate-pulse p-6 h-52"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 rounded-lg bg-secondary h-12 w-12"></div>
                  <div className="h-6 w-6 bg-secondary rounded-full"></div>
                </div>
                <div className="h-6 w-3/4 bg-secondary rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-secondary rounded mb-6"></div>
                <div className="h-2 w-full bg-secondary rounded-full"></div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl group-hover:from-primary/10 group-hover:to-accent/10 transition-all" />

              <div className="relative p-6 rounded-xl bg-card border border-border group-hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-secondary group-hover:bg-secondary/80 transition-colors">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <Heart className="h-6 w-6 fill-destructive text-destructive drop-shadow" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mt-4 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {project.lastModified}
                  </span>
                  <span>{project.documentsCount} docs</span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center rounded-xl bg-card border border-border">
            <Heart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No favorites yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Add projects to your favorites by clicking the heart icon on any
              project in your dashboard.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
