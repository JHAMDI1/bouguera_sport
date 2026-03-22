import { ReactNode } from "react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    children: ReactNode;
}

export function FormSelect({ label, registration, error, children, ...props }: FormSelectProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">
                {label}
            </label>
            <select
                {...registration}
                {...props}
                className={`input w-full ${props.className || ""}`}
            >
                {children}
            </select>
            {error && <p className="mt-1 text-sm text-error">{error.message}</p>}
        </div>
    );
}
