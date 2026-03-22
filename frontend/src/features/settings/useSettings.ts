import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "react-hot-toast";

export function useSettings() {
    const settings = useQuery(api.settings.getSettings);
    const updateSettingsMutation = useMutation(api.settings.updateSettings);

    const updateSettings = async (data: {
        clubName: string;
        currency: string;
        contactEmail: string;
        contactPhone?: string;
        taxRate: number;
        logoUrl?: string;
        address?: string;
    }) => {
        try {
            await updateSettingsMutation({
                clubName: data.clubName,
                currency: data.currency,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone || undefined,
                taxRate: data.taxRate,
                logoUrl: data.logoUrl || undefined,
                address: data.address || undefined,
            });
            toast.success("Paramètres mis à jour avec succès");
            return true;
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour des paramètres");
            return false;
        }
    };

    return {
        settings,
        isLoading: settings === undefined,
        updateSettings,
    };
}
