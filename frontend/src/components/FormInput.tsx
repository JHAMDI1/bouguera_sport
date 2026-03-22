import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
}

export function FormInput({ label, registration, error, ...props }: FormInputProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">
                {label}
            </label>
            <input
                {...registration}
                {...props}
                className={`input w-full ${props.className || ""}`}
            />
            {error && <p className="mt-1 text-sm text-error">{error.message}</p>}
        </div>
    );
}
