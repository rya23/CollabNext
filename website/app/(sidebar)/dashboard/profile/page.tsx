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

  const convertToGhibliStyle = async () => {
    if (!avatarPreview && !userData.avatar) return;

    try {
      setIsConverting(true);
      const sourceImage = avatarPreview || userData.avatar;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Image converted",
        description:
          "Your image has been converted to Ghibli art style. This is a demo - in a real app, this would call an AI image conversion API.",
        variant: "default",
      });
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

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSession();

        if (session?.user) {
          let id = session.user.id || session.user.email || null;

          if (id && id.includes("@")) {
            id = id.toLowerCase();
          }

          setUserId(id);
          setUserName(session.user.name || null);
          setUserEmail(
            session.user.email ? session.user.email.toLowerCase() : null
          );
          setUserImage(session.user.image || null);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUserImage(avatarPreview);
    setIsAvatarDialogOpen(false);

    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated successfully.",
      variant: "default",
    });
  };

  const userData = {
    name: userName || "Nuclitron User",
    username: userEmail ? userEmail.split("@")[0] : "user",
    email: userEmail || "No email provided",
    joinDate: "April 2023",
    bio: "Nuclear physics enthusiast and researcher at Nuclitron.",
    avatar: userImage,
    stats: {
      experiments: 24,
      publications: 7,
      collaborations: 12,
    },
  };

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

  const handleShare = (platform: string) => {
    const profileUrl = `https://nuclitron.science/profile/${userData.username}`;
    const shareText = `Discover ${userData.name}'s groundbreaking nuclear physics research at Nuclitron! With ${userData.stats.experiments} experiments, ${userData.stats.publications} publications, and collaborations across ${userData.stats.collaborations} research teams. Join the frontier of particle physics!`;
    const shortShareText = `Explore ${userData.name}'s nuclear physics research: ${userData.stats.experiments} experiments, ${userData.stats.publications} publications at Nuclitron!`;

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shortShareText
        )}&url=${encodeURIComponent(profileUrl)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          profileUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          profileUrl
        )}&summary=${encodeURIComponent(shareText)}`;
        break;
      case "email":
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

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="texture"></div>

      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">User Profile</h1>

        <Card className="mb-6 bg-card border-border shadow-primary">
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
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-black text-2xl">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center cursor-pointer border-2 border-border hover:bg-accent transition-colors duration-200"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Pencil className="w-3 h-3 text-secondary-foreground" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-2xl font-bold text-primary">
                    {userData.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="w-fit bg-secondary text-secondary-foreground border-border"
                  >
                    @{userData.username}
                  </Badge>
                </div>
                <p className="text-xl text-[#575757]">{userData.bio}</p>
                <p className="text-sm text-[#575757] ">Member since {userData.joinDate}</p>

                <div className="flex gap-4 mt-3">
                  <div>
                    <p className="font-semibold text-primary">
                      {userData.stats.experiments}
                    </p>
                    <p className="text-sm text-[#575757]">Experiments</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {userData.stats.publications}
                    </p>
                    <p className="text-sm text-[#575757]">Publications</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {userData.stats.collaborations}
                    </p>
                    <p className="text-sm text-[#575757]">Collaborations</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-3 items-center justify-center ">
                <Button
                  variant="outline"
                  className="ml-auto bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
                >
                  Edit Profile
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="ml-auto mx-2 bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <Link2 className="mr-2" /> Share Profile
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-popover border-border text-popover-foreground p-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium pl-2 pb-2 border-b border-border">
                        Share via
                      </h4>

                      <div className="grid gap-1">
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-secondary text-twitter"
                          onClick={() => handleShare("twitter")}
                        >
                          <Twitter className="mr-2 h-4 w-4" />
                          <span>Twitter</span>
                        </Button>

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-secondary text-facebook"
                          onClick={() => handleShare("facebook")}
                        >
                          <Facebook className="mr-2 h-4 w-4" />
                          <span>Facebook</span>
                        </Button>

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-secondary text-linkedin"
                          onClick={() => handleShare("linkedin")}
                        >
                          <Linkedin className="mr-2 h-4 w-4" />
                          <span>LinkedIn</span>
                        </Button>

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-secondary text-email"
                          onClick={() => handleShare("email")}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email</span>
                        </Button>

                        <Separator className="my-1 bg-border" />

                        <Button
                          variant="ghost"
                          className="flex items-center justify-start hover:bg-secondary text-copy"
                          onClick={() => handleShare("copy")}
                        >
                          {isCopied ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-success" />
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

        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription className="text-[#575757]">
                Choose a new avatar image for your profile.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative h-36 w-36">
                <Avatar className="h-full w-full border-4 border-primary/20">
                  {isConverting ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/70 rounded-full">
                      <svg
                        className="animate-spin h-10 w-10 text-primary"
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
                      <span className="absolute text-xs text-foreground font-medium mt-12">
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
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-foreground text-4xl">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer py-2 px-4 rounded-md bg-secondary hover:bg-accent text-secondary-foreground text-center transition-colors"
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

                <Button
                  onClick={convertToGhibliStyle}
                  disabled={!avatarPreview && !userData.avatar}
                  className="mt-2 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-accent-foreground text-foreground relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-xs text-[#575757] text-center">
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
                className="border-border text-secondary hover:text-secondary cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAvatarUpload}
                disabled={!avatarFile}
                className="bg-primary hover:bg-accent text-foreground"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-card">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-card border-border shadow-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Activity Overview
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <div className="w-full p-4">
                    <h3 className="text-xl font-semibold mb-4 text-primary">
                      Activity Contributions
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-[#575757] mb-5">
                        April 2024 - April 2025
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#575757]">Less</span>
                        <div className="flex items-center space-x-1">
                          {[
                            "var(--color-muted)", // No activity
                            "var(--color-chart-1)", // Low activity
                            "var(--color-chart-2)", // Medium-low activity
                            "var(--color-chart-3)", // Medium activity
                            "var(--color-chart-4)", // High activity
                          ].map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-sm border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#575757]">More</span>
                      </div>
                    </div>

                    <div className="relative w-full h-full border border-border rounded-md p-4 bg-card">
                      <div className="grid grid-cols-53 gap-1">
                        <div className="col-span-1 grid grid-rows-7 gap-1 pr-2">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day, i) => (
                              <div
                                key={i}
                                className="h-4 flex items-center justify-end"
                              >
                                <span className="text-xs text-[#575757]">
                                  {i % 2 === 0 ? day : ""}
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        <div className="col-span-52 grid grid-cols-52 gap-1 px-3 relative">
                          <div className="absolute inset-0 grid grid-rows-7 pointer-events-none">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div
                                key={i}
                                className="border-t border-border opacity-30"
                                style={{
                                  gridRowStart: i + 1,
                                  marginTop: i === 0 ? "0" : "-1px",
                                }}
                              ></div>
                            ))}
                          </div>

                          {Array.from({ length: 364 }).map((_, i) => {
                            const activityLevel = Math.floor(Math.random() * 5);
                            const color = [
                              "var(--color-muted)",
                              "var(--color-chart-1)",
                              "var(--color-chart-2)",
                              "var(--color-chart-3)",
                              "var(--color-chart-4)",
                            ][activityLevel];

                            const week = Math.floor(i / 7);
                            const dayOfWeek = i % 7;

                            return (
                              <div
                                key={i}
                                className="h-4 w-4 rounded-sm cursor-pointer transition-colors duration-200 hover:ring-1 hover:ring-primary border border-border"
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

                      <div className="absolute top-[-24px] left-8 right-0 flex justify-between text-xs text-[#575757]">
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

                    <div className="mt-6 text-sm text-[#575757] flex justify-between items-center ">
                      <p>12,385 total experiments in the last year</p>
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
                        <span className="text-xs text-[#575757] mr-4">
                          Experiments
                        </span>

                        <span className="inline-block w-3 h-3 bg-secondary rounded-full mr-2"></span>
                        <span className="text-xs text-[#575757] mr-4">
                          Simulations
                        </span>

                        <span className="inline-block w-3 h-3 bg-accent rounded-full mr-2"></span>
                        <span className="text-xs text-[#575757]">
                          Publications
                        </span>
                      </div>
                    </div>
                  </div>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-card border-border shadow-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Activity Timeline
                </h3>

                <div className="relative">
                  <div className="absolute left-[28px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/40 via-secondary/40 to-accent/40"></div>

                  <div className="space-y-8">
                    {activities.map((activity, index) => {
                      const bgColor =
                        activity.type === "experiment"
                          ? "bg-primary/20"
                          : activity.type === "simulation"
                          ? "bg-secondary/20"
                          : "bg-accent/20";

                      const borderColor =
                        activity.type === "experiment"
                          ? "border-primary/40"
                          : activity.type === "simulation"
                          ? "border-secondary/40"
                          : "border-accent/40";

                      const iconBg =
                        activity.type === "experiment"
                          ? "bg-primary"
                          : activity.type === "simulation"
                          ? "bg-secondary"
                          : "bg-accent";

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
                          <div className="relative z-10 mt-1">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg} shadow-lg shadow-black/30 border-2 border-border transition-transform duration-300 hover:scale-110`}
                            >
                              <span className="text-2xl">{icon}</span>
                            </div>
                          </div>

                          <div
                            className={`flex-1 p-4 rounded-lg border border-opacity-30 ${borderColor} ${bgColor} shadow-md transition-all duration-300 hover:shadow-lg hover:border-opacity-60 group`}
                            style={{
                              backdropFilter: "blur(4px)",
                              transform: "translateZ(0)",
                            }}
                          >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                              <div>
                                <h4 className="font-semibold text-primary text-lg group-hover:text-primary/90 transition-colors duration-300">
                                  {activity.name}
                                </h4>
                                <div className="flex items-center mt-1">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      activity.type === "experiment"
                                        ? "bg-primary/40 text-primary-foreground"
                                        : activity.type === "simulation"
                                        ? "bg-secondary/40 text-secondary-foreground"
                                        : "bg-accent/40 text-accent-foreground"
                                    } capitalize`}
                                  >
                                    {activity.type}
                                  </span>
                                  <span className="text-sm text-[#575757] ml-2 flex items-center">
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
                                  className="text-[#575757] hover:text-primary hover:bg-secondary"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>

                            <div className="mt-3 text-sm opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-24 transition-all duration-500">
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
                                className="text-[#575757] hover:text-primary hover:bg-secondary"
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

          <TabsContent value="stats">
            <Card className="bg-card border-border shadow-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Activity Statistics
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={activityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-muted)" />
                    <YAxis stroke="var(--color-muted)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-foreground)",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "var(--color-foreground)" }} />
                    <Line
                      type="monotone"
                      dataKey="experiments"
                      stroke="var(--color-primary)"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="simulations"
                      stroke="var(--color-secondary)"
                    />
                    <Line
                      type="monotone"
                      dataKey="publications"
                      stroke="var(--color-accent)"
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
