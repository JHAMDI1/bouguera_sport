import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { ExpenseFormData } from "@/schemas";

export function useExpenses() {
    const expenses = useQuery(api.payments.getExpenses, {});
    const categories = useQuery(api.payments.getExpenseCategories);
    const users = useQuery(api.users.getUsers, {});

    const createExpenseMutation = useMutation(api.coaches.createExpense);
    const updateExpenseMutation = useMutation(api.coaches.updateExpense);
    const deleteExpenseMutation = useMutation(api.coaches.deleteExpense);

    const toast = useToastHelpers();
    const { confirm, modalProps } = useConfirmModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const createExpense = async (data: ExpenseFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            const currentUser = users?.[0];
            if (!currentUser) {
                toast.error("Erreur", "Utilisateur non connecté");
                return false;
            }

            await createExpenseMutation({
                ...data,
                categoryId: data.categoryId as any,
                recordedBy: currentUser._id,
            });
            toast.success("Dépense enregistrée", `${data.description} - ${data.amount.toLocaleString("fr-FR")} TND`);
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur création dépense:", error);
            toast.error("Erreur", "Impossible d'enregistrer la dépense");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateExpense = async (id: any, data: Partial<ExpenseFormData>, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await updateExpenseMutation({
                id,
                ...data,
                categoryId: data.categoryId as any,
            });
            toast.success("Dépense modifiée", "La dépense a été mise à jour");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur mise à jour dépense:", error);
            toast.error("Erreur", "Impossible de modifier la dépense");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteExpense = async (expense: any, onSuccess?: () => void) => {
        const isConfirmed = await confirm({
            title: "Supprimer la dépense",
            message: `Êtes-vous sûr de vouloir supprimer la dépense "${expense.description}" de ${expense.amount.toLocaleString("fr-FR")} TND ? Cette action est irréversible.`,
            type: "danger",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
        });

        if (isConfirmed) {
            setIsSubmitting(true);
            try {
                await deleteExpenseMutation({ id: expense._id });
                toast.success("Dépense supprimée", "La dépense a été supprimée avec succès");
                onSuccess?.();
            } catch (error) {
                console.error("Erreur suppression dépense:", error);
                toast.error("Erreur", "Impossible de supprimer la dépense");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const getCategoryName = (id: string) => categories?.find((c) => c._id === id)?.name || "Inconnu";
    const getRecordedByName = (id: string) => users?.find((u) => u._id === id)?.fullName || "Inconnu";

    return {
        expenses,
        categories,
        users,
        isSubmitting,
        createExpense,
        updateExpense,
        deleteExpense,
        getCategoryName,
        getRecordedByName,
        modalProps,
    };
}
