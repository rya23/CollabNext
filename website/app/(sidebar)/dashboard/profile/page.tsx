"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link2, Loader2, Pencil } from "lucide-react";
import { getSession } from "@/app/actions/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Twitter, Facebook, Linkedin, Mail, Copy, Check } from "lucide-react";
import Head from "next/head";

// Mock activity data - replace with actual API calls
const mockActivityData = [
  { date: "2025-01", experiments: 3, simulations: 7, publications: 0 },
  { date: "2025-02", experiments: 4, simulations: 5, publications: 1 },
  { date: "2025-03", experiments: 2, simulations: 8, publications: 0 },
  { date: "2025-04", experiments: 5, simulations: 9, publications: 2 },
  { date: "2025-05", experiments: 6, simulations: 4, publications: 1 },
  { date: "2025-06", experiments: 3, simulations: 6, publications: 0 },
];

const recentActivities = [
  {
    id: 1,
    type: "experiment",
    name: "Neutron Flux Analysis",
    date: "2025-04-10",
  },
  {
    id: 2,
    type: "simulation",
    name: "Particle Collision Model",
    date: "2025-04-08",
  },
  {
    id: 3,
    type: "publication",
    name: "Advances in Ion Acceleration",
    date: "2025-04-01",
  },
  {
    id: 4,
    type: "experiment",
    name: "Heavy Ion Fragmentation",
    date: "2025-03-27",
  },
  {
    id: 5,
    type: "simulation",
    name: "Beam Dynamics Simulation",
    date: "2025-03-22",
  },
];

const ProfilePage = () => {
  // State for user session data
  const [userId, setUserId] = useState<string | null>(null);
  // Add this with your other state variables
  const [isConverting, setIsConverting] = useState<boolean | null>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Activity data state
  const [activityData, setActivityData] = useState(mockActivityData);
  const [activities, setActivities] = useState(recentActivities);

  // State for avatar dialog
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add to your component, below handleAvatarUpload function
  const convertToGhibliStyle = async () => {
    // Only proceed if there's an image to convert
    if (!avatarPreview && !userData.avatar) return;

    try {
      // Show loading state
      setIsConverting(true);

      // Get the source image (either preview or current avatar)
      const sourceImage = avatarPreview || userData.avatar;

      // In a real implementation, you would call an AI service API
      // Example with a hypothetical API:
      // const response = await fetch('https://api.example.com/ghibli-converter', {
      //   method: 'POST',
      //   body: JSON.stringify({ imageUrl: sourceImage }),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // const data = await response.json();
      // setAvatarPreview(data.convertedImageUrl);

      // For demo purposes, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Since we don't have the actual API, just show a success message
      toast({
        title: "Image converted",
        description:
          "Your image has been converted to Ghibli art style. This is a demo - in a real app, this would call an AI image conversion API.",
        variant: "default",
      });

      // In a real app, you'd set the new image from the API response
      // For demo purposes, we'll keep the original image
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description:
          "There was an error converting your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Check authentication and get user data
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
          setIsLoading(false);

          // Here you would fetch user profile data from your API/database
          // fetchUserProfile(id);
        } else {
          console.log("No authenticated user found");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Get user initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Add this function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add this function to handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    // In a real app, you would upload the file to your storage service
    // Example:
    // const formData = new FormData();
    // formData.append("avatar", avatarFile);
    // const response = await fetch("/api/user/avatar", {
    //   method: "POST",
    //   body: formData
    // });

    // For now, we'll just update the local state
    setUserImage(avatarPreview);
    setIsAvatarDialogOpen(false);

    // Show success message
    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated successfully.",
      variant: "default",
    });
  };

  // Build user data object for display
  const userData = {
    name: userName || "Nuclitron User",
    username: userEmail ? userEmail.split("@")[0] : "user",
    email: userEmail || "No email provided",
    joinDate: "April 2023", // You might want to store this in your database
    bio: "Nuclear physics enthusiast and researcher at Nuclitron.", // This could come from a user profile API
    avatar: userImage,
    stats: {
      experiments: 24,
      publications: 7,
      collaborations: 12,
    },
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Add this function to handle sharing
  const handleShare = (platform: string) => {
    // Get the profile URL - in a real app, generate a shareable link
    const profileUrl = `https://nuclitron.science/profile/${userData.username}`;

    // Create a more immersive share text with achievements and stats
    const shareText = `Discover ${userData.name}'s groundbreaking nuclear physics research at Nuclitron! With ${userData.stats.experiments} experiments, ${userData.stats.publications} publications, and collaborations across ${userData.stats.collaborations} research teams. Join the frontier of particle physics!`;

    // Shorter text for platforms with character limits
    const shortShareText = `Explore ${userData.name}'s nuclear physics research: ${userData.stats.experiments} experiments, ${userData.stats.publications} publications at Nuclitron!`;

    // In production, the shared URL should have proper Open Graph meta tags
    // for the user's profile image and description

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        // Twitter has character limits, use shorter text
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shortShareText
        )}&url=${encodeURIComponent(profileUrl)}`;
        break;
      case "facebook":
        // Facebook uses Open Graph tags for images, but we can still customize the text
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          profileUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "linkedin":
        // LinkedIn also uses Open Graph, we can pass some text
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          profileUrl
        )}&summary=${encodeURIComponent(shareText)}`;
        break;
      case "email":
        // For email, we can create a more detailed message body
        const emailBody = `
  ${shareText}
  
  Research Focus: Nuclear physics and particle acceleration
  Latest Achievement: ${recentActivities[0]?.name || "Neutron Flux Analysis"}
  
  View the complete profile and research portfolio: ${profileUrl}
  
  --
  Shared from Nuclitron Science Platform
        `;

        shareUrl = `mailto:?subject=${encodeURIComponent(
          `${userData.name}'s Nuclitron Research Profile`
        )}&body=${encodeURIComponent(emailBody)}`;
        break;
      case "copy":
        // When copying, include the rich text description
        navigator.clipboard
          .writeText(`${shareText}\n\n${profileUrl}`)
          .then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          });
        toast({
          title: "Profile link copied!",
          description: "Share link and description copied to clipboard",
          variant: "default",
        });
        return;
    }

    // Track sharing analytics in a real implementation
    // logSharingEvent(platform, userData.username);

    // Open share URL in a new window
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Head>
        <title>{userData.name} | Nuclitron Research Profile</title>
        <meta
          property="og:title"
          content={`${userData.name} | Nuclitron Research`}
        />
        <meta
          property="og:description"
          content={`View ${userData.name}'s research profile with ${userData.stats.experiments} experiments and ${userData.stats.publications} publications`}
        />
        <meta
          property="og:image"
          content={
            userData.avatar ||
            "https://nuclitron.science/default-profile-image.jpg"
          }
        />
        <meta
          property="og:url"
          content={`https://nuclitron.science/profile/${userData.username}`}
        />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">User Profile</h1>

        {/* Profile Header */}
        <Card className="mb-6 bg-card border-border shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  {userData.avatar || avatarPreview ? (
                    <AvatarImage
                      src={avatarPreview || userData.avatar || ""}
                      alt={userData.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Edit icon overlay */}
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#344054] rounded-full flex items-center justify-center cursor-pointer border-2 border-[#1a2234] hover:bg-[#475569] transition-colors duration-200"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Pencil className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-2xl font-bold text-white">
                    {userData.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="w-fit bg-[#344054] text-gray-300 border-[#475569]"
                  >
                    @{userData.username}
                  </Badge>
                </div>
                <p className="text-gray-300">{userData.bio}</p>
                <p className="text-sm text-gray-400">
                  Member since {userData.joinDate}
                </p>

                <div className="flex gap-4 mt-3">
                  <div>
                    <p className="font-semibold text-white">
                      {userData.stats.experiments}
                    </p>
                    <p className="text-sm text-gray-400">Experiments</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {userData.stats.publications}
                    </p>
                    <p className="text-sm text-gray-400">Publications</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {userData.stats.collaborations}
                    </p>
                    <p className="text-sm text-gray-400">Collaborations</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-3 items-center justify-center ">
                <Button
                  variant="outline"
                  className="ml-auto bg-[#344054] text-white border-[#475569] hover:bg-[#475569] hover:text-white"
                >
                  Edit Profile
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="ml-auto mx-2 bg-[#344054] text-white border-[#475569] hover:bg-[#475569] hover:text-white"
                    >
                      <Link2 className="mr-2" /> Share Profile
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-card border-border text-foreground p-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium pl-2 pb-2 border-b border-[#334155]">
                        Share via
                      </h4>

                      <div className="grid gap-1">
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-[#344054] text-[#1DA1F2]"
                          onClick={() => handleShare("twitter")}
                        >
                          <Twitter className="mr-2 h-4 w-4" />
                          <span>Twitter</span>
                        </Button>

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-[#344054] text-[#4267B2]"
                          onClick={() => handleShare("facebook")}
                        >
                          <Facebook className="mr-2 h-4 w-4" />
                          <span>Facebook</span>
                        </Button>

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-[#344054] text-[#0A66C2]"
                          onClick={() => handleShare("linkedin")}
                        >
                          <Linkedin className="mr-2 h-4 w-4" />
                          <span>LinkedIn</span>
                        </Button>

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-[#344054] text-gray-300"
                          onClick={() => handleShare("email")}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email</span>
                        </Button>

                        <Separator className="my-1 bg-[#334155]" />

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-[#344054] text-gray-300"
                          onClick={() => handleShare("copy")}
                        >
                          {isCopied ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              <span>Copy link</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Edit Dialog */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose a new avatar image for your profile.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative h-36 w-36">
                <Avatar className="h-full w-full border-4 border-primary/20">
                  {isConverting ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1D2939]/70 rounded-full">
                      <svg
                        className="animate-spin h-10 w-10 text-indigo-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="absolute text-xs text-white font-medium mt-12">
                        Converting...
                      </span>
                    </div>
                  ) : avatarPreview || userData.avatar ? (
                    <AvatarImage
                      src={avatarPreview || userData.avatar || ""}
                      alt={userData.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer py-2 px-4 rounded-md bg-[#344054] hover:bg-[#475569] text-white text-center transition-colors"
                >
                  Select Image
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Ghibli Art Style Conversion Button */}
                <Button
                  onClick={convertToGhibliStyle}
                  disabled={!avatarPreview && !userData.avatar}
                  className="mt-2 bg-gradient-to-r from-[#52307c] to-[#663a82] hover:from-[#623b94] hover:to-[#7a459c] text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-[url('/ghibli-pattern.png')] opacity-10 bg-repeat group-hover:opacity-20 transition-opacity"></span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 9H9.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 9H15.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Convert to Ghibli Art
                  </span>
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setAvatarPreview(null);
                  setAvatarFile(null);
                  setIsAvatarDialogOpen(false);
                }}
                className="border-[#475569] text-[#344054] hover:text-[#344054] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAvatarUpload}
                disabled={!avatarFile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activity Tracking Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-card">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-card border-border shadow-lg py-3">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Activity Overview
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <div className="w-full p-4">
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      Activity Contributions
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400 mb-5">
                        April 2024 - April 2025
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Less</span>
                        <div className="flex items-center space-x-1">
                          {[
                            "#1e293b", // No activity - dark background similar to GitHub dark mode
                            "#0e4429", // Low activity - dark green
                            "#006d32", // Medium-low activity - medium green
                            "#26a641", // Medium activity - bright green
                            "#39d353", // High activity - vibrant green
                          ].map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-sm border border-[#0f172a]/30"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">More</span>
                      </div>
                    </div>

                    <div className="relative w-full h-full border border-[#334155] rounded-md p-4 bg-[#1a2234]">
                      {/* Activity Grid */}
                      <div className="grid grid-cols-53 gap-1">
                        {/* Days of Week Labels */}
                        <div className="col-span-1 grid grid-rows-7 gap-1 pr-2">
                          {[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ].map((day, i) => (
                            <div
                              key={i}
                              className="h-4 flex items-center justify-end"
                            >
                              <span className="text-xs text-gray-400">
                                {i % 2 === 0 ? day : ""}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Activity Cells */}
                        <div className="col-span-52 grid grid-cols-52 gap-1 px-3 relative">
                          {/* Light grid lines for better visualization */}
                          <div className="absolute inset-0 grid grid-rows-7 pointer-events-none">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div
                                key={i}
                                className="border-t border-[#334155] opacity-30"
                                style={{
                                  gridRowStart: i + 1,
                                  marginTop: i === 0 ? "0" : "-1px",
                                }}
                              ></div>
                            ))}
                          </div>

                          {Array.from({ length: 364 }).map((_, i) => {
                            // Generate random activity level for demo purposes
                            // In a real app, you would map actual activity data to dates
                            const activityLevel = Math.floor(Math.random() * 5);
                            const color = [
                              "#1e293b", // No activity - dark background similar to GitHub dark mode
                              "#0e4429", // Low activity - dark green
                              "#006d32", // Medium-low activity - medium green
                              "#26a641", // Medium activity - bright green
                              "#39d353", // High activity - vibrant green
                            ][activityLevel];

                            // Calculate which week this day belongs to
                            const week = Math.floor(i / 7);
                            const dayOfWeek = i % 7;

                            return (
                              <div
                                key={i}
                                className="h-4 w-4 rounded-sm cursor-pointer transition-colors duration-200 hover:ring-1 hover:ring-white/50 border border-[#0f172a]/20"
                                style={{
                                  backgroundColor: color,
                                  gridColumnStart: week + 1,
                                  gridRowStart: dayOfWeek + 1,
                                }}
                                title={`${activityLevel} experiments on Day ${
                                  i + 1
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Month Labels */}
                      <div className="absolute top-[-24px] left-8 right-0 flex justify-between text-xs text-gray-400">
                        {[
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ].map((month, i) => (
                          <span key={i}>{month}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-400 flex justify-between items-center ">
                      <p>12,385 total experiments in the last year</p>
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-indigo-400 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-300 mr-4">
                          Experiments
                        </span>

                        <span className="inline-block w-3 h-3 bg-emerald-400 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-300 mr-4">
                          Simulations
                        </span>

                        <span className="inline-block w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-300">
                          Publications
                        </span>
                      </div>
                    </div>
                  </div>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    Recent Activities
                  </h3>
                  <div className="space-y-4">
                    {activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 mt-2 rounded-full ${
                            activity.type === "experiment"
                              ? "bg-indigo-400"
                              : activity.type === "simulation"
                              ? "bg-emerald-400"
                              : "bg-purple-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-white">
                            {activity.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {activity.type.charAt(0).toUpperCase() +
                              activity.type.slice(1)}{" "}
                            • {activity.date}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="link"
                      className="px-0 text-indigo-400 hover:text-indigo-300"
                    >
                      View all activities
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6 text-white">
                    Achievements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      {
                        name: "First Experiment",
                        icon: "🧪",
                        color: "from-indigo-600/20 to-indigo-900/40",
                        border: "border-indigo-500/30",
                        description:
                          "Completed your first nuclear physics experiment",
                        date: "April 2023",
                      },
                      {
                        name: "Collaboration Star",
                        icon: "🌟",
                        color: "from-amber-600/20 to-amber-900/40",
                        border: "border-amber-500/30",
                        description:
                          "Participated in 10+ collaborative research projects",
                        date: "January 2025",
                      },
                      {
                        name: "Published Author",
                        icon: "📝",
                        color: "from-emerald-600/20 to-emerald-900/40",
                        border: "border-emerald-500/30",
                        description:
                          "First research paper published in a peer-reviewed journal",
                        date: "March 2025",
                      },
                    ].map((achievement, i) => (
                      <div key={i} className="relative group overflow-hidden">
                        <div
                          className={`h-full rounded-lg border ${achievement.border} bg-gradient-to-br ${achievement.color} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col items-center text-center`}
                        >
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                            <div className="absolute inset-0 rotate-12 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transition-transform duration-1000"></div>
                          </div>

                          {/* Achievement icon */}
                          <div className="relative mb-4">
                            <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-white/5 to-white/0 blur-md"></div>
                            <div className="w-20 h-20 rounded-full bg-[#1a2234] flex items-center justify-center relative shadow-inner shadow-black/20 border border-white/10 group-hover:shadow-lg group-hover:border-white/20 transition-all duration-300">
                              <div className="w-16 h-16 rounded-full bg-[#344054] flex items-center justify-center animate-achievement-pulse">
                                <span className="text-3xl">
                                  {achievement.icon}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Achievement info */}
                          <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90">
                            {achievement.name}
                          </h4>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2 h-10">
                            {achievement.description}
                          </p>
                          <span className="text-xs text-gray-500 bg-[#101828]/70 px-3 py-1 rounded-full">
                            {achievement.date}
                          </span>

                          {/* Bottom glow */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View all achievements button */}
                  <div className="mt-6 text-center">
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-white hover:bg-[#344054] group transition-all duration-300"
                    >
                      <span>View All Achievements</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Activity Timeline
                </h3>

                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[28px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#4f46e5]/40 via-[#10b981]/40 to-[#8b5cf6]/40"></div>

                  <div className="space-y-8">
                    {activities.map((activity, index) => {
                      // Determine styles based on activity type
                      const bgColor =
                        activity.type === "experiment"
                          ? "bg-[#2e3b80]/20"
                          : activity.type === "simulation"
                          ? "bg-[#0d6651]/20"
                          : "bg-[#5e3c9c]/20";

                      const borderColor =
                        activity.type === "experiment"
                          ? "border-[#4f46e5]/40"
                          : activity.type === "simulation"
                          ? "border-[#10b981]/40"
                          : "border-[#8b5cf6]/40";

                      const iconBg =
                        activity.type === "experiment"
                          ? "bg-[#3730a3]"
                          : activity.type === "simulation"
                          ? "bg-[#065f46]"
                          : "bg-[#5b21b6]";

                      const icon =
                        activity.type === "experiment"
                          ? "🧪"
                          : activity.type === "simulation"
                          ? "💻"
                          : "📝";

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-6 animate-timeline-item"
                          style={{
                            animationDelay: `${index * 150}ms`,
                            opacity: 0,
                            transform: "translateY(20px)",
                          }}
                        >
                          {/* Timeline dot */}
                          <div className="relative z-10 mt-1">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg} shadow-lg shadow-black/30 border-2 border-[#1a2234] transition-transform duration-300 hover:scale-110`}
                            >
                              <span className="text-2xl">{icon}</span>
                            </div>
                          </div>

                          {/* Content card */}
                          <div
                            className={`flex-1 p-4 rounded-lg border border-opacity-30 ${borderColor} ${bgColor} shadow-md transition-all duration-300 hover:shadow-lg hover:border-opacity-60 group`}
                            style={{
                              backdropFilter: "blur(4px)",
                              transform: "translateZ(0)",
                            }}
                          >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                              <div>
                                <h4 className="font-semibold text-white text-lg group-hover:text-[#a5b4fc] transition-colors duration-300">
                                  {activity.name}
                                </h4>
                                <div className="flex items-center mt-1">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      activity.type === "experiment"
                                        ? "bg-[#312e81]/40 text-[#a5b4fc]"
                                        : activity.type === "simulation"
                                        ? "bg-[#065f46]/40 text-[#6ee7b7]"
                                        : "bg-[#5b21b6]/40 text-[#c4b5fd]"
                                    } capitalize`}
                                  >
                                    {activity.type}
                                  </span>
                                  <span className="text-sm text-gray-400 ml-2 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {activity.date}
                                  </span>
                                </div>
                              </div>

                              <div className="hidden md:block">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-300 hover:text-white hover:bg-[#344054]"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>

                            <div className="mt-3 text-gray-300 text-sm opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-24 transition-all duration-500">
                              {activity.type === "experiment"
                                ? "Conducted experimental analysis with state-of-the-art equipment to analyze nuclear reactions."
                                : activity.type === "simulation"
                                ? "Computer-based simulation to model complex particle interactions and predict outcomes."
                                : "Academic publication documenting research findings and contributing to the scientific community."}
                            </div>

                            <div className="flex justify-between items-center mt-3 md:hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white hover:bg-[#344054]"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Activity Statistics
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={activityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1D2939",
                        borderColor: "#475569",
                        color: "#f1f5f9",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#f1f5f9" }} />
                    <Line
                      type="monotone"
                      dataKey="experiments"
                      stroke="#a78bfa"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="simulations"
                      stroke="#34d399"
                    />
                    <Line
                      type="monotone"
                      dataKey="publications"
                      stroke="#f97316"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
