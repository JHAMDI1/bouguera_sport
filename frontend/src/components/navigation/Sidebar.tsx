"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationLinks } from "@/lib/navigation";
import { Dumbbell, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export function Sidebar() {
    const pathname = usePathname();
    const { role, isLoading } = useUserRole();

    return (
        <div className="hidden md:flex flex-col w-64 bg-background-elevated border-r border-border min-h-screen">
            <div className="flex items-center justify-center h-16 border-b border-border mb-4">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <Dumbbell className="h-6 w-6 text-primary-text transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" />
                    <span className="font-display font-bold text-xl tracking-tight text-foreground">Sahbi Gym</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-8">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 text-foreground-muted animate-spin" />
                    </div>
                ) : (
                    navigationLinks
                        .filter((link) => role && link.roles.includes(role))
                        .map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                        ? "bg-primary text-on-primary shadow-md"
                                        : "bg-transparent text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-on-primary" : "text-foreground-muted"}`} />
                                    {link.name}
                                </Link>
                            );
                        })
                )}
            </nav>
        </div>
    );
}
