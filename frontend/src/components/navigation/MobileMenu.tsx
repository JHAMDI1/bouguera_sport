"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Dumbbell } from "lucide-react";
import { navigationLinks } from "@/lib/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { role } = useUserRole();

    const links = navigationLinks.filter((link) => role && link.roles.includes(role));

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 text-foreground-secondary hover:text-foreground rounded-md focus:outline-none"
            >
                <Menu className="h-6 w-6" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-4/5 max-w-sm bg-background-elevated h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
                            <Link href="/dashboard" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
                                <Dumbbell className="h-6 w-6 text-primary-text" />
                                <span className="font-display font-bold text-xl tracking-tight text-foreground">Sahbi Gym</span>
                            </Link>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 -mr-2 text-foreground-secondary hover:text-foreground rounded-md"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {links.map((link) => {
                                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                                ? "bg-primary text-on-primary shadow-md"
                                                : "bg-transparent text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                                            }`}
                                    >
                                        <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-on-primary" : "text-foreground-muted"}`} />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
