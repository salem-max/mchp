'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';

interface AdminMenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
    children?: AdminMenuItem[];
}

interface AdminDashboardLayoutProps {
    children: React.ReactNode;
    menuItems: AdminMenuItem[];
    userName?: string;
    userAvatar?: string;
    title?: string;
    className?: string;
}

/**
 * Admin Dashboard Layout
 * Sidebar-based layout for admin panels with collapsible menu
 */
export function AdminDashboardLayout({
    children,
    menuItems,
    userName = 'Admin',
    userAvatar,
    title = 'Admin Dashboard',
    className,
}: AdminDashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const router = useRouter();
    const { logout } = useUserStore();

    const toggleExpanded = (label: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(label)) {
            newExpanded.delete(label);
        } else {
            newExpanded.add(label);
        }
        setExpandedItems(newExpanded);
    };

    const handleLogout = async () => {
        logout();
        router.push('/login');
    };

    const renderMenuItems = (items: AdminMenuItem[], level = 0) => {
        return items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.has(item.label);

            return (
                <div key={item.label}>
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpanded(item.label)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                                'rounded-lg transition-colors font-medium',
                                'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                                'text-gray-700 dark:text-gray-300',
                                level > 0 && 'text-sm'
                            )}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {item.badge}
                                </span>
                            )}
                            <span
                                className={cn(
                                    'transition-transform',
                                    isExpanded && 'rotate-180'
                                )}
                            >
                                ▼
                            </span>
                        </button>
                    ) : (
                        <Link
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-2.5',
                                'rounded-lg transition-colors font-medium',
                                'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                                'text-gray-700 dark:text-gray-300',
                                level > 0 && 'pl-8 text-sm'
                            )}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )}

                    {hasChildren && isExpanded && item.children && (
                        <div className="space-y-1">
                            {renderMenuItems(item.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className={cn('flex h-screen bg-gray-50 dark:bg-slate-950', className)}>
            {/* Sidebar */}
            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-64',
                    'bg-white dark:bg-slate-900',
                    'border-r border-gray-200 dark:border-slate-700',
                    'transform transition-transform lg:transform-none',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-700">
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                        {title}
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
                    {renderMenuItems(menuItems)}
                </div>

                {/* User Section */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800">
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                {userName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Admin</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg',
                            'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                            'hover:bg-red-100 dark:hover:bg-red-900/30',
                            'transition-colors font-medium'
                        )}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:w-[calc(100%-256px)] ml-0 lg:ml-64 flex flex-col">
                {/* Top Bar */}
                <div className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <div />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}

export default AdminDashboardLayout;
