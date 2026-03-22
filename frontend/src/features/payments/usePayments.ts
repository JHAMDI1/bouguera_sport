import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { PaymentFormData } from "@/schemas";
import { useReceiptGenerator } from "@/components/ReceiptPDF";
import { Doc } from "../../../convex/_generated/dataModel";

export function usePayments() {
    const payments = useQuery(api.payments.getPayments, {});
    const members = useQuery(api.members.getMembers, {});
    const disciplines = useQuery(api.disciplines.getDisciplines, {});
    const users = useQuery(api.users.getUsers, {});

    const createPaymentMutation = useMutation(api.mutations.createPayment);
    const updatePaymentMutation = useMutation(api.mutations.updatePayment);
    const cancelPaymentMutation = useMutation(api.payments.cancelPayment);

    const toast = useToastHelpers();
    const { confirm, modalProps } = useConfirmModal();
    const { generateReceiptData } = useReceiptGenerator();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    const createPayment = async (data: PaymentFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            const currentUser = users?.[0];
            if (!currentUser) {
                toast.error("Erreur", "Utilisateur non connecté");
                return false;
            }

            await createPaymentMutation({
                ...data,
                memberId: data.memberId as any,
                familyId: data.familyId as any,
                disciplineId: data.disciplineId as any,
                receivedBy: currentUser._id,
            });

            toast.success("Paiement enregistré", `Reçu ${data.receiptNumber} créé avec succès`);
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur création paiement:", error);
            toast.error("Erreur", "Impossible d'enregistrer le paiement");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updatePayment = async (id: any, data: Partial<PaymentFormData>, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await updatePaymentMutation({
                id,
                ...data,
                memberId: data.memberId as any,
                familyId: data.familyId as any,
                disciplineId: data.disciplineId as any,
            });
            toast.success("Paiement modifié", "Le paiement a été mis à jour avec succès");
            onSuccess?.();
            return true;
        } catch (error) {
            console.error("Erreur mise à jour paiement:", error);
            toast.error("Erreur", "Impossible de modifier le paiement");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelPayment = async (paymentId: string, receiptNumber: string, onSuccess?: () => void) => {
        const isConfirmed = await confirm({
            title: "Annuler le paiement",
            message: `Êtes-vous sûr de vouloir annuler le reçu ${receiptNumber} ? Cette action marquera le paiement comme "ANNULÉ" dans le registre.`,
            type: "danger",
            confirmText: "Oui, annuler ce paiement",
            cancelText: "Retour",
        });

        if (isConfirmed) {
            setIsSubmitting(true);
            try {
                await cancelPaymentMutation({ paymentId });
                toast.success("Paiement annulé", `Le reçu ${receiptNumber} a été annulé avec succès`);
                onSuccess?.();
            } catch (error) {
                console.error("Erreur annulation paiement:", error);
                toast.error("Erreur", "Impossible d'annuler le paiement");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleViewReceipt = (payment: Doc<"payments">) => {
        const member = members?.find((m) => m._id === payment.memberId);
        const user = users?.find((u) => u._id === payment.receivedBy);
        const discipline = disciplines?.find((d) => d._id === payment.disciplineId);
        const receiptData = generateReceiptData(payment, member, user, discipline);
        setSelectedReceipt(receiptData);
    };

    return {
        payments,
        members,
        disciplines,
        users,
        isSubmitting,
        selectedReceipt,
        setSelectedReceipt,
        createPayment,
        updatePayment,
        cancelPayment,
        handleViewReceipt,
        modalProps,
    };
}
