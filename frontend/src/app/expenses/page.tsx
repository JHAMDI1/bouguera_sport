"use client";

import { TrendingDown, Plus, FileText, Edit, Trash2, Settings } from "lucide-react";
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
import { Avatar } from "@/components/Avatar";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";

export default function ExpensesPage() {
  const { expenses, categories, isSubmitting, createExpense, updateExpense, deleteExpense, createCategory, updateCategory, deleteCategory, getCategoryName, getRecordedByName, modalProps } = useExpenses();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

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
      accessor: (expense) => {
        const recordedBy = getRecordedByName(expense.recordedBy);
        return (
          <div className="flex items-center text-sm text-foreground-secondary">
            <Avatar name={recordedBy} size="sm" className="mr-2" />
            {recordedBy}
          </div>
        );
      }
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (expense) => (
        <DropdownMenu>
          <DropdownItem icon={<Edit />} onClick={() => handleEdit(expense)}>
            Modifier
          </DropdownItem>
        </DropdownMenu>
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
        showBack={true}
        icon={<TrendingDown className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle Dépense</span>
          </button>
        }
      >
        <div className="text-right mr-4">
          <p className="text-sm text-foreground-secondary">Dépenses ce mois</p>
          <p className="text-xl font-bold text-error">{totalExpenses.toLocaleString("fr-FR")} TND</p>
        </div>
      </PageHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-4">
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
          <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary text-sm">
            <Settings className="w-4 h-4 mr-2" />
            Gérer les catégories
          </button>
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

      <FormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Gérer les catégories"
        isSubmitting={isSubmitting}
        submitText="Fermer"
        onSubmit={async () => setIsCategoryModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Nouvelle catégorie..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} disabled={isSubmitting} />
            <button type="button" className="btn btn-primary" disabled={isSubmitting || !newCategoryName.trim()} onClick={async () => { await createCategory(newCategoryName); setNewCategoryName(""); }}>Ajouter</button>
          </div>
          <div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-1">
            {categories?.map(c => (
              <div key={c._id} className="flex items-center justify-between p-2 border border-border rounded-lg bg-background-tertiary">
                {editingCategory?._id === c._id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input className="input flex-1" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} autoFocus disabled={isSubmitting} />
                    <button type="button" className="btn btn-primary btn-sm" disabled={isSubmitting || !editingCategory.name.trim()} onClick={async () => { await updateCategory(c._id, editingCategory.name); setEditingCategory(null); }}>OK</button>
                    <button type="button" className="btn btn-subtle btn-sm" disabled={isSubmitting} onClick={() => setEditingCategory(null)}>Annuler</button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-sm">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1 text-foreground-secondary hover:text-primary-text" disabled={isSubmitting} onClick={() => setEditingCategory(c)}> <Edit className="w-4 h-4" /> </button>
                      <button type="button" className="p-1 text-foreground-secondary hover:text-error" disabled={isSubmitting} onClick={() => deleteCategory(c)}> <Trash2 className="w-4 h-4" /> </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
