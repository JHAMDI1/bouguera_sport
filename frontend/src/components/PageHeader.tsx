import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
}

export function PageHeader({ title, icon, action, children }: PageHeaderProps) {
    return (
        <header className="bg-background-elevated border-b border-border shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {icon && <div className="text-primary-text mr-3 flex items-center">{icon}</div>}
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
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
