import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { GroupFormData, UpdateGroupFormData } from "@/schemas";
import { Doc, Id } from "../../../convex/_generated/dataModel";

export function useGroups() {
    const groups = useQuery(api.disciplines.getGroups, {});
    const disciplines = useQuery(api.disciplines.getDisciplines, {});
    const users = useQuery(api.users.getUsers, {});
    const coaches = useQuery(api.users.getUsers, { role: "coach" });
    const members = useQuery(api.members.getMembers, {});

    const createGroupMutation = useMutation(api.coaches.createGroup);
    const updateGroupMutation = useMutation(api.coaches.updateGroup);

    const toast = useToastHelpers();
    const { confirm, modalProps } = useConfirmModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const createGroup = async (data: GroupFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await createGroupMutation({
                ...data,
                disciplineId: data.disciplineId as any,
                coachId: data.coachId as any,
            });
            toast.success("Groupe créé", `Le groupe ${data.name} a été ajouté`);
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur création groupe:", error);
            toast.error("Erreur", "Impossible de créer le groupe");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateGroup = async (id: Id<"groups">, data: UpdateGroupFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await updateGroupMutation({
                id,
                ...data,
                disciplineId: data.disciplineId as any,
                coachId: data.coachId as any,
            });
            toast.success("Groupe mis à jour", "Les modifications ont été enregistrées");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur mise à jour groupe:", error);
            toast.error("Erreur", "Impossible de mettre à jour le groupe");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (group: Doc<"groups">) => {
        const newStatus = !group.isActive;
        const confirmed = await confirm({
            title: newStatus ? "Activer le groupe ?" : "Désactiver le groupe ?",
            message: `Êtes-vous sûr de vouloir ${newStatus ? "activer" : "désactiver"} le groupe ${group.name} ?`,
            type: newStatus ? "success" : "warning",
            confirmText: newStatus ? "Activer" : "Désactiver",
        });

        if (confirmed) {
            try {
                await updateGroupMutation({
                    id: group._id,
                    name: group.name,
                    disciplineId: group.disciplineId,
                    coachId: group.coachId,
                    schedule: group.schedule,
                    maxCapacity: group.maxCapacity,
                    isActive: newStatus,
                });
                toast.success(
                    newStatus ? "Groupe activé" : "Groupe désactivé",
                    `Le groupe est maintenant ${newStatus ? "actif" : "inactif"}`
                );
            } catch (error) {
                console.error("Erreur changement statut:", error);
                toast.error("Erreur", "Impossible de modifier le statut");
            }
        }
    };

    return {
        groups,
        disciplines,
        users,
        coaches,
        members,
        isSubmitting,
        createGroup,
        updateGroup,
        toggleStatus,
        modalProps,
    };
}
