"use client";

import { TrendingDown, Plus, FileText, Edit, Trash2 } from "lucide-react";
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
  const { expenses, categories, isSubmitting, createExpense, updateExpense, deleteExpense, getCategoryName, getRecordedByName, modalProps } = useExpenses();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
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
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { expenseDate: Date.now() },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  const onCreateSubmit = async (data: ExpenseFormData) => {
    await createExpense(data, () => {
      setIsCreateModalOpen(false);
      resetCreate({ expenseDate: Date.now() });
    });
  };

  const onUpdateSubmit = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    await updateExpense(editingExpense._id, data, () => {
      setEditingExpense(null);
      resetUpdate();
    });
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    resetUpdate({
      categoryId: expense.categoryId,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      receiptUrl: expense.receiptUrl || "",
    });
  };

  const handleDelete = async (expense: any) => {
    await deleteExpense(expense, () => {
      setEditingExpense(null);
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
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (expense) => (
        <button
          onClick={() => handleEdit(expense)}
          className="text-primary-text hover:text-primary-active transition-colors p-2"
        >
          <Edit className="h-4 w-4" />
        </button>
      )
    }
  ];

  const ExpenseFormFields = ({ registerFn, errors }: { registerFn: any; errors: any }) => (
    <>
      <FormSelect label="Catégorie" registration={registerFn("categoryId")} error={errors.categoryId} disabled={isSubmitting}>
        <option value="">Sélectionner une catégorie</option>
        {categories?.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </FormSelect>

      <FormInput label="Description" registration={registerFn("description")} error={errors.description} placeholder="Loyer, électricité, matériel..." disabled={isSubmitting} />
      <FormInput label="Montant (TND)" registration={registerFn("amount", { valueAsNumber: true })} error={errors.amount} type="number" min={0.001} step={0.001} inputMode="decimal" placeholder="500.000" disabled={isSubmitting} />

      <FormInput
        label="Date de dépense"
        registration={registerFn("expenseDate", {
          valueAsNumber: true,
          onChange: (e: any) => new Date(e.target.value).getTime(),
        })}
        error={errors.expenseDate}
        type="date"
        disabled={isSubmitting}
      />

      <FormInput label="URL du reçu (optionnel)" registration={registerFn("receiptUrl")} error={errors.receiptUrl} placeholder="https://..." disabled={isSubmitting} />
    </>
  );

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
        onSubmit={handleSubmitCreate(onCreateSubmit)}
        submitText="Enregistrer"
      >
        <ExpenseFormFields registerFn={registerCreate} errors={createErrors} />
      </FormModal>

      <FormModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title="Modifier Dépense"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUpdate(onUpdateSubmit)}
        submitText="Mettre à jour"
      >
        <ExpenseFormFields registerFn={registerUpdate} errors={updateErrors} />

        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleDelete(editingExpense)}
            disabled={isSubmitting}
            className="w-full btn btn-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer cette dépense
          </button>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
