"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Wrench, LogIn, LogOut, UserPlus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ROLE_DASHBOARD: Record<string, string> = {
  CUSTOMER: '/dashboard/customer',
  TECHNICIAN: '/dashboard/technician',
  ADMIN: '/dashboard/admin',
  BOTH: '/dashboard/customer',
};

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Close nav on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const baseNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/integrations", label: "Integrations", icon: Wrench },
    ];

    const authNavItems = user
        ? [
            { href: ROLE_DASHBOARD[user.role] ?? '/dashboard/customer', label: "Dashboard", icon: LayoutDashboard },
            { href: `${ROLE_DASHBOARD[user.role] ?? '/dashboard/customer'}/jobs`, label: "Jobs", icon: Wrench },
        ]
        : [
            { href: "/login", label: "Sign In", icon: LogIn },
            { href: "/signup", label: "Get Started", icon: UserPlus },
        ];

    const navItems = [...baseNavItems, ...authNavItems];

    return (
        <>
            {/* Trigger Button - Fixed bottom right */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-40 md:hidden bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
                aria-label="Open navigation"
            >
                <Wrench className="w-6 h-6" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Bottom Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-nav-title"
            >
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 id="mobile-nav-title" className="text-lg font-semibold">
                            Navigation
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                            aria-label="Close navigation"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User info */}
                    {user && (
                        <div className="mb-4 p-3 rounded-lg bg-muted">
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    )}

                    {/* Nav Items */}
                    <nav className="space-y-2">
                        {navItems.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{label}</span>
                                </Link>
                            );
                        })}
                        {user && (
                            <button
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full text-left hover:bg-destructive/10 text-destructive"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Log out</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
}
