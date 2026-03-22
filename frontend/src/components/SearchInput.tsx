import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function SearchInput(props: SearchInputProps) {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-foreground-muted" />
            </div>
            <input
                type="text"
                className={`input w-full pl-10 ${props.className || ""}`}
                {...props}
            />
        </div>
    );
}
