"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { href: "/", label: "Home", icon: "🏁" },
    { href: "/drivers", label: "Drivers", icon: "🏎️" },
    { href: "/teams", label: "Teams", icon: "🔧" },
    { href: "/calendar", label: "Calendar", icon: "📅" },
    { href: "/circuits", label: "Circuits 2D", icon: "🗺️" },
    { href: "/circuits-3d", label: "Circuits 3D", icon: "🌐" },
    { href: "/standings", label: "Standings", icon: "📊" },
    { href: "/watch", label: "Watch", icon: "📺" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-f1-red to-red-700 flex items-center justify-center font-display font-bold text-white text-sm group-hover:glow-red transition-all duration-300">
                            F1
                        </div>
                        <span className="font-display text-lg font-bold tracking-wider text-white hidden sm:block">
                            RACING<span className="text-f1-red">HUB</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                                            ? "text-white"
                                            : "text-f1-text-muted hover:text-white"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-active"
                                            className="absolute inset-0 bg-f1-red/20 border border-f1-red/30 rounded-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        <span className="text-base">{link.icon}</span>
                                        {link.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2"
                        aria-label="Toggle menu"
                    >
                        <motion.span
                            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                            className="w-6 h-0.5 bg-white block"
                        />
                        <motion.span
                            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="w-6 h-0.5 bg-white block"
                        />
                        <motion.span
                            animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                            className="w-6 h-0.5 bg-white block"
                        />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-strong border-t border-f1-border"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? "bg-f1-red/20 text-white border border-f1-red/30"
                                                : "text-f1-text-muted hover:bg-f1-surface hover:text-white"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="text-lg">{link.icon}</span>
                                            {link.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
