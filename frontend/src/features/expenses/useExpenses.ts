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

    const getCategoryName = (id: string) => categories?.find((c) => c._id === id)?.name || "Inconnu";
    const getRecordedByName = (id: string) => users?.find((u) => u._id === id)?.fullName || "Inconnu";

    return {
        expenses,
        categories,
        users,
        isSubmitting,
        createExpense,
        getCategoryName,
        getRecordedByName,
        modalProps,
    };
}
