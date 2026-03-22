import { ReactNode } from "react";
import { X, Check, Loader2 } from "lucide-react";

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
    children: ReactNode;
    submitText?: string;
    submitIcon?: ReactNode;
}

export function FormModal({
    isOpen,
    onClose,
    title,
    isSubmitting,
    onSubmit,
    children,
    submitText = "Enregistrer",
    submitIcon = <Check className="h-4 w-4 mr-2" />
}: FormModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background-elevated rounded-none p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border-2 border-border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-foreground-muted hover:text-foreground disabled:opacity-50 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="space-y-4">
                        {children}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="btn btn-subtle disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Chargement...</>
                            ) : (
                                <>{submitIcon}{submitText}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
