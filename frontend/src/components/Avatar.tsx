import React from "react";
import { UserCircle } from "lucide-react";

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-orange-100 text-orange-700",
];

// Hash simple pour attribuer toujours la même couleur au même nom
const getInitialsAndColor = (name: string) => {
    if (!name.trim()) return { initials: "?", colorClass: colors[0] };

    const parts = name.trim().split(" ");
    const initials = parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;

    return { initials, colorClass: colors[colorIndex] };
};

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
    };

    const selectedSize = sizeClasses[size];

    if (src) {
        return (
            <img
                src={src}
                alt={`Avatar de ${name}`}
                className={`rounded-full object-cover border border-border shadow-sm flex-shrink-0 ${selectedSize} ${className}`}
            />
        );
    }

    const { initials, colorClass } = getInitialsAndColor(name);

    return (
        <div
            className={`rounded-full flex items-center justify-center border border-transparent shadow-sm flex-shrink-0 font-bold tracking-tight ${selectedSize} ${colorClass} ${className}`}
            aria-label={name}
            title={name}
        >
            {initials}
        </div>
    );
}
