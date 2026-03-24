"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "../navigation/Sidebar";
import { BottomNavBar } from "../navigation/BottomNavBar";
import { UserButton } from "@clerk/nextjs";
import { SyncUser } from "../auth/SyncUser";
import { MobileMenu } from "../navigation/MobileMenu";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <SyncUser />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Uniquement visible sur mobile : un header avec le bouton User */}
                <div className="md:hidden h-14 bg-background-elevated/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-20 shadow-sm sticky top-0">
                    <div className="flex items-center gap-2">
                        <MobileMenu />
                        <span className="font-display font-bold text-lg tracking-tight text-foreground">Sahbi Gym</span>
                    </div>
                    <UserButton />
                </div>

                {/* Header Desktop User Button (absolute top right of main content) */}
                <div className="hidden md:block absolute top-6 right-8 z-20 shadow-sm hover:shadow-md transition-shadow border border-border rounded-full bg-background-elevated h-[36px] w-[36px]">
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
