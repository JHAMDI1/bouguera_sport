"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationLinks } from "@/lib/navigation";
import { Dumbbell } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex flex-col w-64 bg-background-elevated border-r border-border min-h-screen">
            <div className="flex items-center justify-center h-16 border-b border-border mb-4">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <Dumbbell className="h-6 w-6 text-primary-text transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" />
                    <span className="font-display font-bold text-xl tracking-tight text-foreground">Sahbi Gym</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-8">
                {navigationLinks.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-none border-2 transition-all ${isActive
                                ? "bg-primary text-on-primary border-primary shadow-[2px_2px_0px_var(--color-foreground)] -translate-y-[2px]"
                                : "bg-transparent text-foreground-secondary border-transparent hover:border-foreground hover:text-foreground hover:bg-background-tertiary"
                                }`}
                        >
                            <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-on-primary" : "text-foreground-muted"}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
