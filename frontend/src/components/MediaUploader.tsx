import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadCloud, Loader2, X, File as FileIcon } from "lucide-react";
import toast from "react-hot-toast";

interface MediaUploaderProps {
    onUploadComplete: (storageId: string) => void;
    accept?: string;
    maxSizeMB?: number;
    label?: string;
    className?: string;
}

export function MediaUploader({
    onUploadComplete,
    accept = "image/*",
    maxSizeMB = 5,
    label = "Cliquez pour uploader un fichier",
    className = ""
}: MediaUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation de taille
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`Le fichier dépasse la limite max de ${maxSizeMB}MB`);
            return;
        }

        setSelectedFile(file);
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            // 1. Obtenir l'URL d'upload de Convex
            const uploadUrl = await generateUploadUrl();

            // 2. Envoyer le fichier
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            if (!response.ok) {
                throw new Error("Échec de l'upload du fichier");
            }

            // 3. Récupérer le storageId généré
            const { storageId } = await response.json();

            onUploadComplete(storageId);
            toast.success("Fichier uploadé avec succès !");
        } catch (error: any) {
            toast.error(error.message || "Une erreur s'est produite lors de l'upload.");
            setSelectedFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <label
                className={`relative flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${isUploading ? 'border-primary-300 bg-primary-50 opacity-70 pointer-events-none' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary-400'}
        `}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                            <p className="text-sm text-slate-500 font-medium tracking-tight">Upload en cours...</p>
                        </>
                    ) : selectedFile ? (
                        <>
                            <div className="p-3 bg-primary-100 text-primary rounded-full mb-2">
                                <FileIcon className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700 truncate max-w-xs">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-200 text-slate-500 rounded-full mb-2 transition-transform group-hover:scale-110">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
                            <p className="text-xs text-slate-500">Taille max: {maxSizeMB}MB</p>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </label>

            {selectedFile && !isUploading && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setSelectedFile(null);
                        // On pourrait appeler une fonction onRemove si nécessaire
                    }}
                    className="mt-2 text-xs font-medium text-error flex items-center gap-1 hover:underline"
                >
                    <X className="w-3 h-3" /> Retirer le fichier sélectionné
                </button>
            )}
        </div>
    );
}
