"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Define TypeScript interfaces
interface SidebarLink {
  name: string;
  url: string;
}

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  links?: SidebarLink[];
}

// Sidebar menu items with sub-links
const items: SidebarItem[] = [
  {
    title: "Home",
    url: "#",
    icon: Home,
    links: [
      { name: "Dashboard", url: "#" },
      { name: "Profile", url: "#" },
    ],
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
    links: [
      { name: "Messages", url: "#" },
      { name: "Notifications", url: "#" },
    ],
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
    links: [
      { name: "Events", url: "#" },
      { name: "Reminders", url: "#" },
    ],
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
    links: [
      { name: "Users", url: "#" },
      { name: "Documents", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    links: [
      { name: "Account", url: "#" },
      { name: "Privacy", url: "#" },
    ],
  },
];

export function AppSidebar() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar className="bg-gradient-to-r from-purple-700 to-blue-500 text-white h-screen w-64 shadow-xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold uppercase tracking-wide">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild={false}
                      className="flex items-center justify-between p-3 hover:bg-purple-900 rounded-lg transition-all"
                      onClick={() => toggleSection(item.title)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="text-white">{item.title}</span>
                      </div>
                      {item.links && (openSections[item.title] ? (
                        <ChevronUp className="w-4 h-4 text-white" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white" />
                      ))}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Submenu with animation */}
                  {item.links && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: openSections[item.title] ? "auto" : 0,
                        opacity: openSections[item.title] ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden ml-6"
                    >
                      {item.links.map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          className="block py-2 px-3 text-sm text-gray-200 hover:text-white hover:bg-purple-800 rounded-lg transition-all"
                        >
                          {link.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
