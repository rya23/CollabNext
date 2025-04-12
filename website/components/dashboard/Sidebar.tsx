'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Star, Settings, Users, FolderKanban, Bell, LogOut, ChevronLeft, Menu, Loader2 } from 'lucide-react';
import { auth } from '@/auth';
import { handleSignOut } from '@/app/actions/auth';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

const menuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
    },
    {
        title: 'Projects',
        icon: FolderKanban,
        path: '/dashboard/project/1',
    },
    {
        title: 'Favorites',
        icon: Star,
        path: '/dashboard/favorites',
    },
    {
        title: 'Whiteboard',
        icon: LayoutDashboard,
        path: '/dashboard/whiteboard',
    },
    {
        title: 'Settings',
        icon: Settings,
        path: '/dashboard/settings',
    },
    {
        title: 'Flow Chart',
        icon: LayoutDashboard,
        path: '/dashboard/flow',
    },
];

export default function Sidebar({ session }: { session: any }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<{
        name: string | null;
        email: string | null;
        image: string | null;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session && session.user) {
            setUser({
                name: session.user.name || null,
                email: session.user.email || null,
                image: session.user.image || null,
            });
            setIsLoading(false);
        }
    }, [session]);

    // Get user initials for avatar fallback
    const getInitials = (name: string) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="fixed top-4 right-4 p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white lg:hidden z-50"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Backdrop for mobile */}
            {!isCollapsed && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40" onClick={() => setIsCollapsed(true)} />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: isCollapsed ? -300 : 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className={`fixed left-0 top-0 bottom-0 w-[280px] bg-[#0A0A0A] border-r border-gray-800 flex flex-col z-50`}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <span className="text-white font-semibold text-xl">NUCLITRON</span>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 py-6 px-4">
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all group
                      ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.title}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="ml-auto w-2 h-2 rounded-full bg-blue-500"
                                            />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Notifications Section */}
                    <div className="mt-6 px-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-white">What's new?</span>
                            </div>
                            <p className="text-xs text-gray-400">Check out the latest updates and features in our changelog.</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-800">
                    {isLoading ? (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            </div>
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse mb-1"></div>
                                <div className="h-3 w-16 bg-gray-800 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-3 px-2">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-white font-medium">{getInitials(user.name || 'User')}</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">{user.name || 'User'}</h4>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <button
                                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                onClick={() => handleSignOut()}
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-400 font-medium">?</span>
                            </div>
                            <div className="flex-1">
                                <Link href="/login" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                                    Sign in
                                </Link>
                                <p className="text-xs text-gray-400">to sync your projects</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Collapse Button - Always visible */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`fixed ${
                    isCollapsed ? 'left-4' : 'left-[260px]'
                } top-8 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-50`}
            >
                <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
        </>
    );
}
