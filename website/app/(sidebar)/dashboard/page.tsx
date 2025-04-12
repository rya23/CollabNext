"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Folder,
  Heart,
  Plus,
  FileText,
  Clock,
  Search,
  Filter,
  Users,
  BarChart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getSession } from "@/app/actions/auth";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

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

// Project interface
interface Project {
  id: string;
  title: string;
  lastModified: string;
  documentsCount: number;
  isFavorite: boolean;
  members: number;
  progress: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

  // Monitor user ID state
  useEffect(() => {
    console.log("User ID state changed:", userId);
  }, [userId]);

  // Check authentication and get user ID
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("Checking authentication status...");
        const session = await getSession();
        console.log(
          "Session details:",
          session
            ? {
                hasUser: !!session.user,
                hasId: !!session.user?.id,
                hasEmail: !!session.user?.email,
                hasName: !!session.user?.name,
              }
            : "No session"
        );

        if (session?.user) {
          // Handle possible undefined values with nullish coalescing
          let id = session.user.id || session.user.email || null;

          // Normalize email addresses for consistent lookup
          if (id && id.includes("@")) {
            id = id.toLowerCase();
          }

          console.log("Setting user ID to:", id);
          setUserId(id);
          setUserName(session.user.name || null);
          setUserEmail(
            session.user.email ? session.user.email.toLowerCase() : null
          );
          setUserImage(session.user.image || null);

          // Use email as the user ID for Firebase when NextAuth ID is not available
          const firebaseUserId = id;
          console.log(
            "Using Firebase user ID for fetching projects:",
            firebaseUserId
          );
          if (firebaseUserId) {
            fetchProjects(firebaseUserId);
          } else {
            console.error("No valid Firebase user ID available!");
          }
        } else {
          console.log("No authenticated user found");
          setIsLoading(false);
          toast({
            title: "Authentication recommended",
            description: "Sign in to save your projects and preferences",
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [toast]);

  // Fetch projects from Firebase
  const fetchProjects = async (uid: string) => {
    try {
      console.log("Fetching projects for user ID:", uid);
      setIsLoading(true);

      // Normalize user ID if it's an email
      const normalizedUid = uid.includes("@") ? uid.toLowerCase() : uid;
      console.log("Using normalized user ID:", normalizedUid);

      // Get all projects - simplified query that doesn't require a composite index
      const projectsRef = collection(db, "projects");
      console.log("Projects collection reference created");

      // Option 1: Use a simpler query without orderBy for now
      const q = query(
        projectsRef,
        where("createdBy", "==", normalizedUid)
        // Removing the orderBy to avoid composite index requirement
      );
      console.log("Query created to fetch projects");

      const querySnapshot = await getDocs(q);
      console.log("Query executed, found", querySnapshot.size, "projects");

      // Log all projects found for debugging
      querySnapshot.forEach((doc) => {
        console.log("Found project:", doc.id, "with data:", doc.data());
      });

      // Get user's favorite projects
      const favoritesRef = collection(db, "userFavorites");
      console.log("Created favorites collection reference");

      const favQ = query(favoritesRef, where("userId", "==", normalizedUid));
      console.log("Created favorites query with userId:", normalizedUid);

      const favSnapshot = await getDocs(favQ);
      console.log(
        "Favorites query executed, found",
        favSnapshot.size,
        "favorites"
      );

      // Log all favorite documents for debugging
      console.log("Listing all favorites found:");
      favSnapshot.forEach((favoriteDoc) => {
        console.log("Favorite:", favoriteDoc.id, "Data:", favoriteDoc.data());
      });

      // Create a set of favorite project IDs for quick lookup
      const favoriteIds = new Set();
      favSnapshot.forEach((doc) => {
        const projectId = doc.data().projectId;
        console.log(`Adding project ID to favorites: ${projectId}`);
        favoriteIds.add(projectId);
      });

      // Convert to array for logging
      const favoriteIdsArray = Array.from(favoriteIds);
      console.log("Favorite IDs processed:", favoriteIdsArray);
      console.log("Number of favorites:", favoriteIdsArray.length);

      // Map projects with favorite status
      let projectsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const projectId = doc.id;
        console.log("Processing project:", projectId, data);

        // Enhanced favorite check that handles possible type or format issues
        let isFavorite = favoriteIds.has(projectId);

        // If not found directly, try checking if it's contained in any of the favorite IDs
        // This handles case when projectId might be stored differently (e.g., as a substring)
        if (!isFavorite && favoriteIdsArray.length > 0) {
          isFavorite = favoriteIdsArray.some(
            (favId) =>
              typeof favId === "string" &&
              typeof projectId === "string" &&
              (favId.includes(projectId) || projectId.includes(favId))
          );
        }

        console.log(`Project ${projectId} isFavorite: ${isFavorite}`);

        return {
          id: projectId,
          title: data.title,
          lastModified: data.updatedAt
            ? new Date(data.updatedAt.seconds * 1000).toLocaleDateString()
            : "Recent",
          documentsCount: data.documentsCount || 0,
          isFavorite: isFavorite,
          members: data.members || 1,
          progress: data.progress || 0,
        };
      });

      // Manually sort by updatedAt since we're not using orderBy in the query
      projectsData = projectsData.sort((a, b) => {
        // For simplicity, we're using lastModified as a string comparison
        // In a real app, you'd want to convert these back to dates
        return b.lastModified.localeCompare(a.lastModified);
      });

      console.log("Final projects data:", projectsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);

      // Check for missing index error
      if (
        error instanceof Error &&
        error.message.includes("The query requires an index")
      ) {
        console.error(
          "Firestore index error. You need to create a composite index."
        );
        // toast({
        //   title: "Database setup required",
        //   description:
        //     "A Firestore index needs to be created. Check console for details.",
        //   variant: "destructive",
        // });
      } else {
        // toast({
        //   title: "Error loading projects",
        //   description: "Please try again later",
        //   variant: "destructive",
        // });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    console.log("Creating project with user ID:", userId);

    if (newProjectName.trim() === "") {
      toast({
        title: "Title required",
        description: "Please enter a project title",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      console.log("No user ID available for project creation");
      // toast({
      //   title: "Authentication required",
      //   description: "Please sign in to create projects",
      //   variant: "destructive",
      // });
      return;
    }

    try {
      setIsLoading(true);
      console.log(
        "Creating new project with ID:",
        userId,
        "and name:",
        newProjectName
      );

      // Create new project in Firestore
      const projectId = uuidv4();
      console.log("Generated project ID:", projectId);

      // Create project document reference
      const projectRef = doc(db, "projects", projectId);
      console.log("Project reference created:", projectRef.path);

      // Ensure createdBy matches exactly with the userId used for fetching
      // This is important because we query by this field
      console.log("Verifying user ID for project creation:", userId);

      // If userId is an email, ensure it's consistent (lowercase)
      const normalizedUserId = userId.includes("@")
        ? userId.toLowerCase()
        : userId;

      const newProject = {
        id: projectId,
        title: newProjectName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: normalizedUserId, // Use normalized ID for consistency
        creatorName: userName || "Anonymous User",
        creatorEmail: userEmail ? userEmail.toLowerCase() : null, // Normalize email
        documentsCount: 0,
        members: 1,
        progress: 0,
      };

      console.log(
        "Project object to save:",
        JSON.stringify(newProject, null, 2)
      );

      try {
        console.log("Attempting to write to Firestore...");
        await setDoc(projectRef, newProject);
        console.log("Project saved to Firestore successfully");

        // Verify the project was created by reading it back
        console.log("Verifying project was saved by reading it back...");
        const savedProjectSnapshot = await getDoc(projectRef);
        if (savedProjectSnapshot.exists()) {
          console.log(
            "Project verified in database:",
            savedProjectSnapshot.data()
          );
        } else {
          console.error("Project not found in database after creation!");
        }

        // Manually fetch projects after creation to ensure latest data
        console.log("Refreshing projects list after creation...");
        await fetchProjects(normalizedUserId);
      } catch (firebaseError) {
        console.error("Firebase error during project creation:", firebaseError);
        throw firebaseError;
      }

      // Reset form
      setNewProjectName("");
      setModalOpen(false);

      toast({
        title: "Project created",
        description: "Your new project has been created successfully",
      });

      // Navigate to the new project
      router.push(`/dashboard/project/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      // toast({
      //   title: "Error creating project",
      //   description: "Please try again later",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    console.log("Toggle favorite for project:", id, "Current userId:", userId);

   /*  if (!userId) {
      console.error("No user ID available for toggling favorites");
      toast({
        title: "Authentication required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    } */

    try {
      // Find the project and get its current favorite status
      const project = projects.find((p) => p.id === id);
      if (!project) {
        console.error("Project not found in local state:", id);
        return;
      }

      const newFavoriteStatus = !project.isFavorite;
      console.log(
        `Changing favorite status to: ${
          newFavoriteStatus ? "favorite" : "not favorite"
        }`
      );

      // Update local state first for responsive UI
      setProjects(
        projects.map((project) =>
          project.id === id
            ? { ...project, isFavorite: newFavoriteStatus }
            : project
        )
      );
      console.log("Local state updated");

      // Normalize userId for consistency
      const normalizedUserId = userId.includes("@")
        ? userId.toLowerCase()
        : userId;
      console.log("Using normalized user ID:", normalizedUserId);

      // Favorite document ID combines user and project IDs for uniqueness
      const favoriteId = `${normalizedUserId}_${id}`;
      console.log("Using favorite document ID:", favoriteId);

      if (newFavoriteStatus) {
        // Add to favorites
        console.log("Adding to favorites in Firestore...");
        const favoriteData = {
          userId: normalizedUserId,
          projectId: id,
          createdAt: serverTimestamp(),
          userEmail: userEmail,
          userName: userName,
        };
        console.log("Favorite data:", favoriteData);

        const favoriteRef = doc(db, "userFavorites", favoriteId);
        console.log("Favorite document reference created:", favoriteRef.path);

        await setDoc(favoriteRef, favoriteData);
        console.log("Favorite document created successfully");

        // Verify the favorite was added
        const verifyDoc = await getDoc(favoriteRef);
        if (verifyDoc.exists()) {
          console.log("Verified favorite in database:", verifyDoc.data());
        } else {
          console.error(
            "Failed to add favorite - document not found after creation"
          );
        }

        toast({
          title: "Added to favorites",
          description: `"${project.title}" has been added to your favorites`,
        });
      } else {
        // Remove from favorites
        console.log("Removing from favorites in Firestore...");
        const favoriteRef = doc(db, "userFavorites", favoriteId);

        // Check if the document exists before deleting
        const docSnapshot = await getDoc(favoriteRef);
        if (docSnapshot.exists()) {
          console.log("Favorite document exists, deleting it...");
          await deleteDoc(favoriteRef);
          console.log("Favorite document deleted successfully");
        } else {
          console.warn("Favorite document does not exist, nothing to delete");
        }

        toast({
          title: "Removed from favorites",
          description: `"${project.title}" has been removed from your favorites`,
        });
      }

      // Refresh projects to ensure favorites are up to date
      console.log("Refreshing projects after toggling favorite...");

      // Delay the refresh slightly to give Firestore time to update
      setTimeout(async () => {
        await fetchProjects(normalizedUserId);
        console.log("Projects refreshed after toggling favorite");
      }, 300);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error updating favorite",
        description: "Please try again later",
      });

      // Revert the local state change if there was an error
      if (userId) {
        // Use normalized userId for consistency
        const normalizedUserId = userId.includes("@")
          ? userId.toLowerCase()
          : userId;
        console.log("Refreshing projects after error...");
        fetchProjects(normalizedUserId);
      }
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    // Stop event propagation to prevent navigating to the project
    e.stopPropagation();
    console.log(`User clicked to toggle favorite for project: ${id}`);
    await toggleFavorite(id);
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Log projects state right before rendering
  console.log("Projects state before rendering:", {
    totalProjects: projects.length,
    filteredProjects: filteredProjects.length,
    searchQuery: searchQuery || "(empty)",
    isLoading,
  });

  return (
    <div className="flex flex-col w-full min-h-screen p-6 bg-gray-900">
      <Toaster />

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {userName ? `${userName}'s Projects` : "My Projects"}
          </h1>
          <p className="text-gray-400 mt-1">Manage and organize your work</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 focus:border-blue-500"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            New Project
          </motion.button>
        </div>
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
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => router.push(`/dashboard/project/${project.id}`)}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all" />

              {/* Content */}
              <div className="relative p-6 rounded-xl bg-gray-800 border border-gray-700 group-hover:border-gray-600 transition-all">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-gray-700 group-hover:bg-gray-600 transition-colors">
                    <Folder
                      className={`h-6 w-6 ${
                        project.isFavorite ? "text-amber-400" : "text-blue-400"
                      }`}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleToggleFavorite(project.id, e)}
                    className="focus:outline-none"
                  >
                    <Heart
                      className={`h-6 w-6 transition-colors ${
                        project.isFavorite
                          ? "fill-red-500 text-red-500 drop-shadow-glow"
                          : "text-gray-500 hover:text-red-400"
                      }`}
                    />
                  </motion.button>
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
            <Folder className="h-16 w-16 mx-auto mb-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-white mb-4">
              No projects found
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery
                ? "Try a different search term"
                : "Create your first project to get started"}
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Create a Project
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Create New Project
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Plus className="h-6 w-6 transform rotate-45" />
                </button>
              </div>
              <Input
                type="text"
                placeholder="Project Title"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 mb-6"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
