"use client";

import { TrendingDown, Plus, FileText } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmModal } from "@/components/ConfirmModal";
import { expenseSchema, type ExpenseFormData } from "@/schemas";
import { useExpenses } from "@/features/expenses/useExpenses";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";

export default function ExpensesPage() {
  const { expenses, categories, isSubmitting, createExpense, getCategoryName, getRecordedByName, modalProps } = useExpenses();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const monthExpenses = expenses?.filter((e) => {
    const date = new Date(e.expenseDate);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });

  const totalExpenses = monthExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  const filteredExpenses = selectedCategory
    ? expenses?.filter((e) => e.categoryId === selectedCategory)
    : expenses;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { expenseDate: Date.now() },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    await createExpense(data, () => {
      setIsCreateModalOpen(false);
      reset({ expenseDate: Date.now() });
    });
  };

  const columns: Column<any>[] = [
    {
      header: "Date",
      accessor: (expense) => (
        <span className="text-sm text-foreground-secondary">
          {new Date(expense.expenseDate).toLocaleDateString("fr-FR")}
        </span>
      )
    },
    {
      header: "Catégorie",
      accessor: (expense) => (
        <span className="badge badge-warning">{getCategoryName(expense.categoryId)}</span>
      )
    },
    {
      header: "Description",
      accessor: (expense) => (
        <div className="flex items-center text-sm text-foreground">
          <FileText className="h-4 w-4 mr-2 text-foreground-muted" />
          {expense.description}
        </div>
      )
    },
    {
      header: "Montant",
      accessor: (expense) => (
        <span className="text-sm text-error font-semibold">
          {expense.amount.toLocaleString("fr-FR")} TND
        </span>
      )
    },
    {
      header: "Enregistré par",
      accessor: (expense) => (
        <span className="text-sm text-foreground-secondary">
          {getRecordedByName(expense.recordedBy)}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Gestion des Dépenses"
        icon={<TrendingDown className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Dépense
          </button>
        }
      >
        <div className="text-right mr-4">
          <p className="text-sm text-foreground-secondary">Dépenses ce mois</p>
          <p className="text-xl font-bold text-error">{totalExpenses.toLocaleString("fr-FR")} TND</p>
        </div>
      </PageHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <select
            className="input w-64"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <DataTable
          data={filteredExpenses}
          columns={columns}
          keyExtractor={(e) => e._id}
          isLoading={!expenses}
          emptyMessage="Aucune dépense trouvée"
        />
      </main>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvelle Dépense"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        submitText="Enregistrer"
      >
        <FormSelect label="Catégorie" registration={register("categoryId")} error={errors.categoryId} disabled={isSubmitting}>
          <option value="">Sélectionner une catégorie</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </FormSelect>

        <FormInput label="Description" registration={register("description")} error={errors.description} placeholder="Loyer, électricité, matériel..." disabled={isSubmitting} />
        <FormInput label="Montant (TND)" registration={register("amount", { valueAsNumber: true })} error={errors.amount} type="number" min={0.001} step={0.001} inputMode="decimal" placeholder="500.000" disabled={isSubmitting} />

        <FormInput
          label="Date de dépense"
          registration={register("expenseDate", {
            valueAsNumber: true,
            onChange: (e) => new Date(e.target.value).getTime(),
          })}
          error={errors.expenseDate}
          type="date"
          disabled={isSubmitting}
        />

        <FormInput label="URL du reçu (optionnel)" registration={register("receiptUrl")} error={errors.receiptUrl} placeholder="https://..." disabled={isSubmitting} />
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
