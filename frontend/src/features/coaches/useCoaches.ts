import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { CoachFormData, UpdateCoachFormData } from "@/schemas";
import { Doc, Id } from "../../../convex/_generated/dataModel";

export function useCoaches() {
    const coaches = useQuery(api.users.getUsers, { role: "coach" });

    const createCoachMutation = useMutation(api.coaches.createCoach);
    const updateCoachMutation = useMutation(api.coaches.updateCoach);
    const deleteCoachMutation = useMutation(api.coaches.deleteCoach);

    const toast = useToastHelpers();
    const { confirm, modalProps } = useConfirmModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const createCoach = async (data: CoachFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await createCoachMutation(data);
            toast.success("Coach ajouté", `${data.fullName} a été ajouté avec succès`);
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur ajout coach:", error);
            toast.error("Erreur", "Impossible d'ajouter le coach");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateCoach = async (id: Id<"users">, data: UpdateCoachFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await updateCoachMutation({
                id,
                ...data,
            });
            toast.success("Coach mis à jour", "Les informations ont été modifiées avec succès");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur mise à jour coach:", error);
            toast.error("Erreur", "Impossible de mettre à jour le coach");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (coach: Doc<"users">) => {
        const newStatus = !coach.isActive;
        const confirmed = await confirm({
            title: newStatus ? "Activer le coach ?" : "Désactiver le coach ?",
            message: `Êtes-vous sûr de vouloir ${newStatus ? "activer" : "désactiver"} ${coach.fullName} ?`,
            type: newStatus ? "success" : "warning",
            confirmText: newStatus ? "Activer" : "Désactiver",
        });

        if (confirmed) {
            try {
                await updateCoachMutation({
                    id: coach._id,
                    fullName: coach.fullName,
                    phone: coach.phone || undefined,
                    isActive: newStatus,
                });
                toast.success(
                    newStatus ? "Coach activé" : "Coach désactivé",
                    `${coach.fullName} est maintenant ${newStatus ? "actif" : "inactif"}`
                );
            } catch (error) {
                console.error("Erreur changement statut:", error);
                toast.error("Erreur", "Impossible de modifier le statut");
            }
        }
    };

    const deleteCoach = async (coach: Doc<"users">, onSuccess?: () => void) => {
        const isConfirmed = await confirm({
            title: "Supprimer le coach",
            message: `Êtes-vous sûr de vouloir supprimer le coach ${coach.fullName} ? Cette action est irréversible.`,
            type: "danger",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
        });

        if (isConfirmed) {
            setIsSubmitting(true);
            try {
                await deleteCoachMutation({ id: coach._id });
                toast.success("Coach supprimé", "Le coach a été supprimé avec succès.");
                onSuccess?.();
            } catch (error) {
                console.error("Erreur suppression coach:", error);
                toast.error("Erreur", "Impossible de supprimer le coach. Il/elle a peut-être des groupes.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return {
        coaches,
        isSubmitting,
        createCoach,
        updateCoach,
        deleteCoach,
        toggleStatus,
        modalProps,
    };
}
