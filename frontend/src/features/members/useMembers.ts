import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { MemberFormData } from "@/schemas";
import { Doc, Id } from "../../../convex/_generated/dataModel";

export function useMembers() {
    const members = useQuery(api.members.getMembers, {});
    const createMemberMutation = useMutation(api.mutations.createMember);
    const updateMemberMutation = useMutation(api.mutations.updateMember);

    const toast = useToastHelpers();
    const { confirm, modalProps } = useConfirmModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const createMember = async (data: MemberFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await createMemberMutation(data);
            toast.success("Adhérent créé", `${data.firstName} ${data.lastName} a été ajouté avec succès`);
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur création adhérent:", error);
            toast.error("Erreur", "Impossible de créer l'adhérent");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateMember = async (id: Id<"members">, data: Partial<MemberFormData>, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await updateMemberMutation({ id, ...data });
            toast.success("Adhérent mis à jour", "Les informations ont été modifiées avec succès");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur mise à jour adhérent:", error);
            toast.error("Erreur", "Impossible de mettre à jour l'adhérent");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (member: Doc<"members">) => {
        const newStatus = !member.isActive;
        const confirmed = await confirm({
            title: newStatus ? "Activer l'adhérent ?" : "Désactiver l'adhérent ?",
            message: `Êtes-vous sûr de vouloir ${newStatus ? "activer" : "désactiver"} ${member.firstName} ${member.lastName} ?`,
            type: newStatus ? "success" : "warning",
            confirmText: newStatus ? "Activer" : "Désactiver",
        });

        if (confirmed) {
            try {
                await updateMemberMutation({ id: member._id, isActive: newStatus });
                toast.success(
                    newStatus ? "Adhérent activé" : "Adhérent désactivé",
                    `${member.firstName} ${member.lastName} est maintenant ${newStatus ? "actif" : "inactif"}`
                );
            } catch (error) {
                console.error("Erreur changement statut:", error);
                toast.error("Erreur", "Impossible de modifier le statut");
            }
        }
    };

    return {
        members,
        isSubmitting,
        createMember,
        updateMember,
        toggleStatus,
        modalProps,
    };
}
