"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "../navigation/Sidebar";
import { BottomNavBar } from "../navigation/BottomNavBar";
import { UserButton } from "@clerk/nextjs";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Uniquement visible sur mobile : un header avec le bouton User */}
                <div className="md:hidden h-14 bg-background-elevated border-b-2 border-border flex items-center justify-between px-4 z-20 shadow-[0_2px_0_var(--color-foreground)]">
                    <span className="font-display text-xl tracking-wider text-primary-text">SAHBI GYM</span>
                    <UserButton />
                </div>

                {/* Header Desktop User Button (absolute top right of main content) */}
                <div className="hidden md:block absolute top-4 right-8 z-20 shadow-[2px_2px_0_var(--color-foreground)] border-2 border-foreground rounded-full bg-background-elevated h-[36px] w-[36px]">
                    <UserButton />
                </div>

                <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative z-10 w-full h-full">
                    {children}
                </main>

                <BottomNavBar />
            </div>
        </div>
    );
}
