import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { DisciplineFormData, UpdateDisciplineFormData } from "@/schemas";
import { Doc } from "../../../convex/_generated/dataModel";

export function useDisciplines() {
    const disciplines = useQuery(api.disciplines.getDisciplines, {});
    const users = useQuery(api.users.getUsers, {});

    const createDisciplineMutation = useMutation(api.coaches.createDiscipline);
    const updateDisciplineMutation = useMutation(api.coaches.updateDiscipline);
    const deleteDisciplineMutation = useMutation(api.coaches.deleteDiscipline);

    const toast = useToastHelpers();
    const { confirm, modalProps } = useConfirmModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const createDiscipline = async (data: DisciplineFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            const currentUser = users?.[0];
            await createDisciplineMutation({
                ...data,
                createdBy: currentUser?._id,
            });
            toast.success("Discipline créée", "La discipline a été ajoutée avec succès");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur création discipline:", error);
            toast.error("Erreur", "Impossible de créer la discipline");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateDiscipline = async (id: any, data: Partial<UpdateDisciplineFormData>, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await updateDisciplineMutation({
                id,
                ...data,
            });
            toast.success("Discipline modifiée", "Les informations ont été mises à jour");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur modification discipline:", error);
            toast.error("Erreur", "Impossible de modifier la discipline");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteDiscipline = async (discipline: Doc<"disciplines">, onSuccess?: () => void) => {
        const isConfirmed = await confirm({
            title: "Supprimer la discipline",
            message: `Êtes-vous sûr de vouloir supprimer la discipline "${discipline.name}" ? Aucune récupération n'est possible.`,
            type: "danger",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
        });

        if (isConfirmed) {
            setIsSubmitting(true);
            try {
                const currentUser = users?.[0];
                await deleteDisciplineMutation({
                    id: discipline._id,
                    deletedBy: currentUser?._id
                });
                toast.success("Discipline supprimée", "La discipline a bien été effacée");
                onSuccess?.();
            } catch (error) {
                console.error("Erreur suppression discipline:", error);
                toast.error("Erreur", "Des groupes utilisent peut-être cette discipline.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const toggleStatus = async (discipline: Doc<"disciplines">) => {
        setIsSubmitting(true);
        try {
            await updateDisciplineMutation({
                id: discipline._id,
                isActive: !discipline.isActive,
            });
            toast.success(
                "Statut modifié",
                `La discipline est maintenant ${!discipline.isActive ? "active" : "inactive"}`
            );
        } catch (error) {
            console.error("Erreur changement statut:", error);
            toast.error("Erreur", "Impossible de modifier le statut");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        disciplines,
        isSubmitting,
        createDiscipline,
        updateDiscipline,
        deleteDiscipline,
        toggleStatus,
        modalProps,
    };
}
