import React from "react";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "rounded";
}

export function Skeleton({ className = "", variant = "rounded" }: SkeletonProps) {
    const baseClass = "skeleton"; // from globals.css

    let variantClass = "";
    switch (variant) {
        case "text":
            variantClass = "rounded-md h-4 w-full";
            break;
        case "circular":
            variantClass = "rounded-full h-10 w-10";
            break;
        case "rectangular":
            variantClass = "h-full w-full"; // no radius
            break;
        case "rounded":
        default:
            variantClass = "rounded-xl h-full w-full";
            break;
    }

    return (
        <div className={`${baseClass} ${variantClass} ${className}`} aria-hidden="true" />
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="table-container p-4 space-y-4">
            <div className="flex gap-4 mb-6">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={`h-${i}`} variant="text" className="h-4 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, rIndex) => (
                <div key={`r-${rIndex}`} className="flex gap-4 border-t border-border pt-4">
                    <Skeleton variant="circular" className="h-8 w-8 flex-none" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-3/4" />
                        <Skeleton variant="text" className="w-1/2" />
                    </div>
                    <Skeleton variant="text" className="h-8 w-16" />
                </div>
            ))}
        </div>
    );
}
