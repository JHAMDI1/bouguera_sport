export interface StatusBadgeProps {
    status: boolean;
    activeText?: string;
    inactiveText?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function StatusBadge({
    status,
    activeText = "Actif",
    inactiveText = "Inactif",
    onClick,
    disabled
}: StatusBadgeProps) {
    const className = `badge ${status ? "badge-success" : "badge-error"} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={className}
            >
                {status ? activeText : inactiveText}
            </button>
        );
    }

    return (
        <span className={className}>
            {status ? activeText : inactiveText}
        </span>
    );
}
