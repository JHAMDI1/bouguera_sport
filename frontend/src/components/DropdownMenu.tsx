import React, { useState, useRef, useEffect, ReactNode } from "react";
import { MoreVertical } from "lucide-react";

interface DropdownMenuProps {
    children: ReactNode;
    triggerIcon?: ReactNode;
}

export function DropdownMenu({ children, triggerIcon = <MoreVertical className="h-5 w-5" /> }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleChildClick = (e: React.MouseEvent) => {
        // Si c'est un bouton à l'intérieur, fermer le menu
        if ((e.target as HTMLElement).tagName.toLowerCase() === "button") {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center justify-center p-2 text-foreground-secondary hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors focus-ring"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {triggerIcon}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-background-elevated border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in"
                    role="menu"
                    aria-orientation="vertical"
                    onClick={handleChildClick}
                >
                    <div className="py-1" role="none">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}

// Wrapper optionnel pour les items du dropdown
export function DropdownItem({
    onClick,
    icon,
    children,
    danger = false
}: {
    onClick?: () => void;
    icon?: ReactNode;
    children: ReactNode;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`group flex w-full items-center px-4 py-2.5 text-sm transition-colors ${danger
                    ? "text-error hover:bg-error-subtle"
                    : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                }`}
            role="menuitem"
        >
            {icon && <span className="mr-3 h-4 w-4">{icon}</span>}
            <span className="font-medium">{children}</span>
        </button>
    );
}
