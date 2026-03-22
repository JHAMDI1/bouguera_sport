import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
}

export function PageHeader({ title, icon, action, children }: PageHeaderProps) {
    return (
        <header className="bg-background-elevated shadow-[4px_4px_0px_var(--color-foreground)] border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {icon && <div className="text-primary-text mr-3 flex items-center">{icon}</div>}
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
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
