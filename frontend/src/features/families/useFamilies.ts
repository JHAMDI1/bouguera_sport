import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { FamilyFormData, UpdateFamilyFormData } from "@/schemas";
import { Id, Doc } from "../../../convex/_generated/dataModel";

export function useFamilies() {
    const families = useQuery(api.families.getFamilies, {});
    const members = useQuery(api.members.getMembers, {});

    const createFamilyMutation = useMutation(api.families.createFamily);
    const updateFamilyMutation = useMutation(api.families.updateFamily);
    const deleteFamilyMutation = useMutation(api.families.deleteFamily);

    const toast = useToastHelpers();
    const { confirm, modalProps } = useConfirmModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const createFamily = async (data: FamilyFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await createFamilyMutation({ ...data, discountPercentage: data.discountPercentage || undefined });
            toast.success("Famille créée", `La famille ${data.familyName} a été ajoutée`);
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur création famille:", error);
            toast.error("Erreur", "Impossible de créer la famille");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFamily = async (id: Id<"families">, data: UpdateFamilyFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await updateFamilyMutation({ id, ...data, discountPercentage: data.discountPercentage || undefined });
            toast.success("Famille mise à jour", "Les modifications ont été enregistrées");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur mise à jour famille:", error);
            toast.error("Erreur", "Impossible de mettre à jour la famille");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (family: Doc<"families">) => {
        const newStatus = !family.isActive;
        const confirmed = await confirm({
            title: newStatus ? "Activer la famille ?" : "Désactiver la famille ?",
            message: `Êtes-vous sûr de vouloir ${newStatus ? "activer" : "désactiver"} la famille ${family.familyName} ?`,
            type: newStatus ? "success" : "warning",
            confirmText: newStatus ? "Activer" : "Désactiver",
        });

        if (confirmed) {
            try {
                await updateFamilyMutation({
                    id: family._id,
                    familyName: family.familyName,
                    primaryContactName: family.primaryContactName,
                    primaryContactPhone: family.primaryContactPhone,
                    discountPercentage: family.discountPercentage,
                    isActive: newStatus,
                });
                toast.success(
                    newStatus ? "Famille activée" : "Famille désactivée",
                    `La famille est maintenant ${newStatus ? "active" : "inactive"}`
                );
            } catch (error) {
                console.error("Erreur changement statut:", error);
                toast.error("Erreur", "Impossible de modifier le statut");
            }
        }
    };

    const deleteFamily = async (family: Doc<"families">, onSuccess?: () => void) => {
        const isConfirmed = await confirm({
            title: "Supprimer la famille",
            message: `Êtes-vous sûr de vouloir supprimer la famille ${family.familyName} ? Cette action est irréversible.`,
            type: "danger",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
        });

        if (isConfirmed) {
            setIsSubmitting(true);
            try {
                await deleteFamilyMutation({ id: family._id });
                toast.success("Famille supprimée", "La famille a été supprimée avec succès.");
                onSuccess?.();
            } catch (error) {
                console.error("Erreur suppression famille:", error);
                toast.error("Erreur", "Impossible de supprimer la famille. Elle est peut-être liée à des membres.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return {
        families,
        members,
        isSubmitting,
        createFamily,
        updateFamily,
        deleteFamily,
        toggleStatus,
        modalProps,
    };
}
