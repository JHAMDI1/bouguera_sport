import { ReactNode } from "react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12 px-4 shadow-[4px_4px_0px_var(--color-foreground)] border-2 border-border bg-background-elevated">
            {icon && (
                <div className="mx-auto h-12 w-12 text-foreground-muted mb-4 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            {description && <p className="mt-2 text-sm text-foreground-secondary">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
