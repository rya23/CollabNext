"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Check,
  ChevronsUpDown,
  BellRing,
  Globe,
  Clock,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

const languages = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Japanese", value: "ja" },
  { label: "Chinese", value: "zh" },
];

const timezones = [
  { label: "(GMT-08:00) Pacific Time", value: "America/Los_Angeles" },
  { label: "(GMT-07:00) Mountain Time", value: "America/Denver" },
  { label: "(GMT-06:00) Central Time", value: "America/Chicago" },
  { label: "(GMT-05:00) Eastern Time", value: "America/New_York" },
  { label: "(GMT+00:00) UTC", value: "UTC" },
  { label: "(GMT+01:00) Central European Time", value: "Europe/Paris" },
  { label: "(GMT+05:30) Indian Standard Time", value: "Asia/Kolkata" },
  { label: "(GMT+08:00) China Standard Time", value: "Asia/Shanghai" },
  { label: "(GMT+09:00) Japan Standard Time", value: "Asia/Tokyo" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openTimezone, setOpenTimezone] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [timezone, setTimezone] = useState("UTC");
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Avoid hydration mismatch by only rendering after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-10 pl-[8rem]">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="bg-[#0A0A0A] border-gray-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Appearance</CardTitle>
            <CardDescription className="text-gray-400">
              Customize how Nuclitron looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme" className="text-white">
                  Theme
                </Label>
                <div className="text-sm text-gray-400">
                  Choose between light and dark theme
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-700 hover:bg-gray-800 hover:text-white"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language and Region */}
        <Card className="bg-[#0A0A0A] border-gray-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Language & Region</CardTitle>
            <CardDescription className="text-gray-400">
              Set your language and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-white">
                Language
              </Label>
              <Popover open={openLanguage} onOpenChange={setOpenLanguage}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLanguage}
                    className="w-full justify-between bg-[#1A1A1A] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {languages.find((l) => l.value === language)?.label ||
                      "Select language"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-[#1A1A1A] border-gray-700">
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="Search language..."
                      className="text-gray-300"
                    />
                    <CommandEmpty className="text-gray-400">
                      No language found.
                    </CommandEmpty>
                    <CommandGroup>
                      {languages.map((lang) => (
                        <CommandItem
                          key={lang.value}
                          value={lang.value}
                          onSelect={(currentValue) => {
                            setLanguage(currentValue);
                            setOpenLanguage(false);
                          }}
                          className="text-gray-300 hover:bg-gray-800"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              language === lang.value
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {lang.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-white">
                Timezone
              </Label>
              <Popover open={openTimezone} onOpenChange={setOpenTimezone}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTimezone}
                    className="w-full justify-between bg-[#1A1A1A] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {timezones.find((t) => t.value === timezone)?.label ||
                      "Select timezone"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-[#1A1A1A] border-gray-700">
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="Search timezone..."
                      className="text-gray-300"
                    />
                    <CommandEmpty className="text-gray-400">
                      No timezone found.
                    </CommandEmpty>
                    <CommandGroup>
                      {timezones.map((tz) => (
                        <CommandItem
                          key={tz.value}
                          value={tz.value}
                          onSelect={(currentValue) => {
                            setTimezone(currentValue);
                            setOpenTimezone(false);
                          }}
                          className="text-gray-300 hover:bg-gray-800"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              timezone === tz.value
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {tz.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-[#0A0A0A] border-gray-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Notifications</CardTitle>
            <CardDescription className="text-gray-400">
              Configure how and when you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="app-notifications" className="text-white">
                  App Notifications
                </Label>
                <div className="text-sm text-gray-400">
                  Receive notifications within the application
                </div>
              </div>
              <Switch
                id="app-notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-white">
                  Email Notifications
                </Label>
                <div className="text-sm text-gray-400">
                  Receive notifications via email
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-[#0A0A0A] border-gray-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Preferences</CardTitle>
            <CardDescription className="text-gray-400">
              Customize your workflow and user experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save" className="text-white">
                  Auto Save
                </Label>
                <div className="text-sm text-gray-400">
                  Automatically save your work as you type
                </div>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}