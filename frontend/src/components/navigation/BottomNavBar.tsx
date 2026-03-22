"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationLinks } from "@/lib/navigation";

export function BottomNavBar() {
    const pathname = usePathname();

    // Pour le mobile, on ne montre que les 4-5 liens principaux pour éviter de surcharger
    const mobileLinks = navigationLinks.slice(0, 5);

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-elevated/80 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
            <nav className="flex items-center justify-around h-16">
                {mobileLinks.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? "text-primary-text" : "text-foreground-muted hover:text-foreground"
                                }`}
                        >
                            <Icon className={`h-6 w-6 mb-1 ${isActive ? "fill-primary text-primary-active" : ""}`} />
                            <span className="text-[10px] font-medium leading-none">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
