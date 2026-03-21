"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DollarSign, Plus, TrendingDown, X, Check, Calendar, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastHelpers } from "@/components/Toast";
import { ConfirmModal, useConfirmModal } from "@/components/ConfirmModal";

const expenseSchema = z.object({
  categoryId: z.string().min(1, "Catégorie requise"),
  description: z.string().min(2, "Description requise"),
  amount: z.number().min(0.001, "Montant requis"),
  expenseDate: z.number().min(1, "Date requise"),
  receiptUrl: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function ExpensesPage() {
  const expenses = useQuery(api.payments.getExpenses, {});
  const categories = useQuery(api.payments.getExpenseCategories);
  const users = useQuery(api.users.getUsers, {});
  const createExpense = useMutation(api.coaches.createExpense);
  const toast = useToastHelpers();
  const { confirm, modalProps } = useConfirmModal();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    defaultValues: {
      expenseDate: Date.now(),
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const currentUser = users?.[0];
      if (!currentUser) {
        toast.error("Erreur", "Utilisateur non connecté");
        setIsSubmitting(false);
        return;
      }

      await createExpense({
        ...data,
        categoryId: data.categoryId as any,
        recordedBy: currentUser._id,
      });
      toast.success("Dépense enregistrée", `${data.description} - ${data.amount.toLocaleString("fr-FR")} TND`);
      setIsCreateModalOpen(false);
      reset({
        expenseDate: Date.now(),
      });
    } catch (error) {
      console.error("Erreur création dépense:", error);
      toast.error("Erreur", "Impossible d'enregistrer la dépense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (id: string) => {
    return categories?.find((c) => c._id === id)?.name || "Inconnu";
  };

  const getRecordedByName = (id: string) => {
    const user = users?.find((u) => u._id === id);
    return user?.fullName || "Inconnu";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingDown className="h-6 w-6 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Dépenses</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Dépenses ce mois</p>
                <p className="text-xl font-bold text-red-600">{totalExpenses.toLocaleString("fr-FR")} TND</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Dépense
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6">
          <select
            className="border rounded-lg px-4 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enregistré par</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses?.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.expenseDate).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                      {getCategoryName(expense.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      {expense.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {expense.amount.toLocaleString("fr-FR")} TND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRecordedByName(expense.recordedBy)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!expenses && (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          )}
          {filteredExpenses?.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucune dépense trouvée</div>
          )}
        </div>
      </main>

      {/* Modal Création Dépense */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Dépense</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    {...register("categoryId")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    {...register("description")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border px-3 py-2"
                    placeholder="Loyer, électricité, matériel..."
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant (TND)</label>
                  <input
                    {...register("amount", { valueAsNumber: true })}
                    type="number"
                    min={0.001}
                    step={0.001}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border px-3 py-2"
                    placeholder="500.000"
                    disabled={isSubmitting}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de dépense</label>
                  <input
                    {...register("expenseDate", {
                      valueAsNumber: true,
                      onChange: (e) => {
                        const date = new Date(e.target.value);
                        return date.getTime();
                      },
                    })}
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {errors.expenseDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expenseDate.message}</p>
                  )}
                </div>

                {/* URL Reçu (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL du reçu (optionnel)</label>
                  <input
                    {...register("receiptUrl")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border px-3 py-2"
                    placeholder="https://..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal {...modalProps} />
    </div>
  );
}
