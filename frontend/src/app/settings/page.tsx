"use client";

import { useSettings } from "@/features/settings/useSettings";
import { PageHeader } from "@/components/PageHeader";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormInput } from "@/components/FormInput";

const settingsSchema = z.object({
    clubName: z.string().min(1, "Le nom du club est requis"),
    currency: z.string().min(1, "La devise est requise"),
    contactEmail: z.string().email("Email invalide"),
    contactPhone: z.string().optional(),
    taxRate: z.number().min(0).max(100),
    address: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
    const { settings, isLoading, updateSettings } = useSettings();

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
    });

    useEffect(() => {
        if (settings) {
            // Cast safely without `any`
            const s = settings as unknown as (SettingsFormData & { logoUrl?: string });
            reset({
                clubName: s.clubName || "Ma Salle de Sport",
                currency: s.currency || "TND",
                contactEmail: s.contactEmail || "",
                contactPhone: s.contactPhone || "",
                taxRate: s.taxRate || 0,
                address: s.address || "",
            });
        }
    }, [settings, reset]);

    const onSubmit = async (data: SettingsFormData) => {
        await updateSettings({
            ...data,
            logoUrl: (settings as unknown as { logoUrl?: string })?.logoUrl, // Conserver si existant
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Paramètres SaaS"
                description="Configuration globale de la salle de sport (Nom, Devise, Taxes)"
                icon={<SettingsIcon className="h-6 w-6" />}
            />

            <div className="card p-6 max-w-2xl mx-auto shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Nom du Club"
                            registration={register("clubName")}
                            error={errors.clubName}
                        />

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Devise par défaut</label>
                            <select
                                {...register("currency")}
                                className="input w-full"
                            >
                                <option value="TND">Dinar Tunisien (TND)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">Dollar ($)</option>
                                <option value="CAD">Dollar Canadien (CAD)</option>
                            </select>
                            {errors.currency && (
                                <p className="text-sm text-error mt-1">{errors.currency.message}</p>
                            )}
                        </div>

                        <FormInput
                            label="Email de contact"
                            type="email"
                            registration={register("contactEmail")}
                            error={errors.contactEmail}
                        />

                        <FormInput
                            label="Téléphone de contact"
                            registration={register("contactPhone")}
                            error={errors.contactPhone}
                        />

                        <FormInput
                            label="Taux de TVA (%)"
                            type="number"
                            step="0.01"
                            registration={register("taxRate", { valueAsNumber: true })}
                            error={errors.taxRate}
                        />

                        <FormInput
                            label="Adresse postale"
                            registration={register("address")}
                            error={errors.address}
                        />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
