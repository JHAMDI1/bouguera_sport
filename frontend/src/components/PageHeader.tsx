"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
    showBack?: boolean;
}

export function PageHeader({ title, description, icon, action, children, showBack }: PageHeaderProps) {
    const router = useRouter();

    return (
        <header className="bg-background-elevated border-b border-border shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                <div className="flex flex-wrap items-center justify-between gap-y-4">
                    <div className="flex items-center">
                        {showBack && (
                            <button
                                onClick={() => router.back()}
                                className="mr-3 p-2 -ml-2 text-foreground-secondary hover:text-foreground hover:bg-background-tertiary rounded-full transition-colors md:hidden"
                                aria-label="Retour"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        {icon && <div className="text-primary-text mr-3 flex items-center">{icon}</div>}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                            {description && <p className="mt-1 text-sm text-foreground-secondary">{description}</p>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {children}
                        {action}
                    </div>
                </div>
            </div>
        </header>
    );
}
