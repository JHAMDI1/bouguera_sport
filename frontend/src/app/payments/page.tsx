"use client";

import { Wallet, Plus, User, Users, Receipt, Printer } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ReceiptPDF } from "@/components/ReceiptPDF";
import { paymentSchema, type PaymentFormData } from "@/schemas";
import { usePayments } from "@/features/payments/usePayments";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { SearchInput } from "@/components/SearchInput";
import { getMemberName, getUserName } from "@/lib/lookups";

export default function PaymentsPage() {
  const {
    payments,
    members,
    disciplines,
    users,
    isSubmitting,
    selectedReceipt,
    setSelectedReceipt,
    createPayment,
    handleViewReceipt,
    modalProps,
  } = usePayments();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const monthPayments = payments?.filter(
    (p) => p.monthCovered === currentMonth && p.yearCovered === currentYear
  );

  const totalRevenue = monthPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      monthCovered: currentMonth,
      yearCovered: currentYear,
      receiptNumber: `REC-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    await createPayment(data, () => {
      setIsCreateModalOpen(false);
      reset({
        monthCovered: currentMonth,
        yearCovered: currentYear,
        receiptNumber: `REC-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      });
    });
  };

  const filteredPayments = payments?.filter((p) => {
    if (selectedMonth && p.monthCovered !== selectedMonth) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        p.receiptNumber.toLowerCase().includes(search) ||
        p.notes?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const columns: Column<any>[] = [
    {
      header: "N° Reçu",
      accessor: (payment) => (
        <div className="flex items-center font-medium text-foreground text-sm">
          <Receipt className="h-4 w-4 mr-2 text-foreground-muted" />
          #{payment.receiptNumber}
        </div>
      )
    },
    {
      header: "Membre/Famille",
      accessor: (payment) => (
        <div className="text-sm text-foreground">
          {payment.memberId ? (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-primary-text" />
              {getMemberName(members, payment.memberId)}
            </div>
          ) : payment.familyId ? (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-secondary" />
              Famille
            </div>
          ) : (
            "-"
          )}
        </div>
      )
    },
    {
      header: "Montant",
      accessor: (payment) => (
        <div className="text-sm text-foreground font-semibold">
          {payment.amount.toLocaleString("fr-FR")} TND
        </div>
      )
    },
    {
      header: "Mois couvert",
      accessor: (payment) => (
        <div className="text-sm text-foreground-secondary">
          {new Date(payment.yearCovered, payment.monthCovered - 1).toLocaleString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </div>
      )
    },
    {
      header: "Date de paiement",
      accessor: (payment) => (
        <div className="text-sm text-foreground-secondary">
          {new Date(payment.paymentDate).toLocaleDateString("fr-FR")}
        </div>
      )
    },
    {
      header: "Reçu par",
      accessor: (payment) => (
        <div className="text-sm text-foreground-secondary">
          {getUserName(users, payment.receivedBy)}
        </div>
      )
    },
    {
      header: "Actions",
      accessor: (payment) => (
        <button
          onClick={() => handleViewReceipt(payment)}
          className="text-primary-text hover:text-primary-active flex items-center text-sm transition-colors p-2"
          title="Voir le reçu"
        >
          <Printer className="h-4 w-4 mr-1" />
          Reçu
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Gestion des Paiements"
        icon={<Wallet className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Paiement
          </button>
        }
      >
        <div className="text-right mr-4">
          <p className="text-sm text-foreground-secondary">Revenus ce mois</p>
          <p className="text-xl font-bold text-success">
            {totalRevenue.toLocaleString("fr-FR")} TND
          </p>
        </div>
      </PageHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex space-x-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Rechercher un paiement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={selectedMonth || ""}
            onChange={(e) =>
              setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">Tous les mois</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i, 1).toLocaleString("fr-FR", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          data={filteredPayments}
          columns={columns}
          keyExtractor={(p) => p._id}
          isLoading={!payments}
          emptyMessage="Aucun paiement trouvé"
        />
      </main>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouveau Paiement"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        submitText="Enregistrer le paiement"
      >
        <FormSelect label="Membre" registration={register("memberId")} error={errors.memberId} disabled={isSubmitting}>
          <option value="">Sélectionner un membre</option>
          {members?.map((m) => (
            <option key={m._id} value={m._id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Montant (TND)"
          registration={register("amount", { valueAsNumber: true })}
          error={errors.amount}
          type="number"
          min={1}
          step={0.001}
          inputMode="numeric"
          placeholder="50.000"
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Mois couvert" registration={register("monthCovered", { valueAsNumber: true })} disabled={isSubmitting}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i, 1).toLocaleString("fr-FR", { month: "long" })}
              </option>
            ))}
          </FormSelect>
          <FormInput label="Année" registration={register("yearCovered", { valueAsNumber: true })} type="number" inputMode="numeric" disabled={isSubmitting} />
        </div>

        <FormInput
          label="Numéro de reçu"
          registration={register("receiptNumber")}
          error={errors.receiptNumber}
          placeholder="REC-001"
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1">Notes (optionnel)</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="input w-full"
            placeholder="Commentaires sur le paiement..."
            disabled={isSubmitting}
          />
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />

      {selectedReceipt && (
        <ReceiptPDF
          data={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
