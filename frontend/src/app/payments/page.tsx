"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Wallet, Plus, Search, X, Check, User, Users, Receipt, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastHelpers } from "@/components/Toast";
import { ConfirmModal, useConfirmModal } from "@/components/ConfirmModal";
import { ReceiptPDF, useReceiptGenerator } from "@/components/ReceiptPDF";

const paymentSchema = z.object({
  memberId: z.string().optional(),
  familyId: z.string().optional(),
  disciplineId: z.string().optional(),
  amount: z.number().min(1, "Montant requis"),
  monthCovered: z.number().min(1).max(12),
  yearCovered: z.number().min(2020).max(2100),
  receiptNumber: z.string().min(1, "Numéro de reçu requis"),
  notes: z.string().optional(),
}).refine((data) => data.memberId || data.familyId, {
  message: "Vous devez sélectionner un membre ou une famille",
  path: ["memberId"],
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const payments = useQuery(api.payments.getPayments, {});
  const members = useQuery(api.members.getMembers, {});
  const disciplines = useQuery(api.disciplines.getDisciplines, {});
  const users = useQuery(api.users.getUsers, {});
  const createPayment = useMutation(api.mutations.createPayment);
  const toast = useToastHelpers();
  const { confirm, modalProps } = useConfirmModal();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const { generateReceiptData } = useReceiptGenerator();

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
    watch,
    setValue,
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
    setIsSubmitting(true);
    try {
      const currentUser = users?.[0];
      if (!currentUser) {
        toast.error("Erreur", "Utilisateur non connecté");
        setIsSubmitting(false);
        return;
      }

      await createPayment({
        ...data,
        memberId: data.memberId as any,
        familyId: data.familyId as any,
        disciplineId: data.disciplineId as any,
        receivedBy: currentUser._id,
      });
      toast.success("Paiement enregistré", `Reçu ${data.receiptNumber} créé avec succès`);
      setIsCreateModalOpen(false);
      reset({
        monthCovered: currentMonth,
        yearCovered: currentYear,
        receiptNumber: `REC-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      });
    } catch (error) {
      console.error("Erreur création paiement:", error);
      toast.error("Erreur", "Impossible d'enregistrer le paiement");
    } finally {
      setIsSubmitting(false);
    }
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

  const getMemberName = (id: string | undefined) => {
    if (!id) return null;
    const member = members?.find((m) => m._id === id);
    return member ? `${member.firstName} ${member.lastName}` : "Inconnu";
  };

  const getReceivedByName = (id: string) => {
    const user = users?.find((u) => u._id === id);
    return user?.fullName || "Inconnu";
  };

  const handleViewReceipt = (payment: any) => {
    const member = members?.find((m) => m._id === payment.memberId);
    const user = users?.find((u) => u._id === payment.receivedBy);
    const discipline = disciplines?.find((d) => d._id === payment.disciplineId);
    
    const receiptData = generateReceiptData(payment, member, user, discipline);
    setSelectedReceipt(receiptData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="h-6 w-6 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des Paiements
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Revenus ce mois</p>
                <p className="text-xl font-bold text-green-600">
                  {totalRevenue.toLocaleString("fr-FR")} TND
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Paiement
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un paiement..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg px-4 py-2"
            value={selectedMonth || ""}
            onChange={(e) =>
              setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">Tous les mois</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i, 1).toLocaleString("fr-FR", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  N° Reçu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Membre/Famille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mois couvert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date de paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reçu par
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments?.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Receipt className="h-4 w-4 mr-2 text-gray-400" />
                      #{payment.receiptNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.memberId ? (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-blue-400" />
                        {getMemberName(payment.memberId)}
                      </div>
                    ) : payment.familyId ? (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-purple-400" />
                        Famille
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {payment.amount.toLocaleString("fr-FR")} TND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(
                      payment.yearCovered,
                      payment.monthCovered - 1
                    ).toLocaleString("fr-FR", { month: "long", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getReceivedByName(payment.receivedBy)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewReceipt(payment)}
                      className="text-green-600 hover:text-green-900 flex items-center"
                      title="Voir le reçu"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Reçu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!payments && (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          )}
          {filteredPayments?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun paiement trouvé
            </div>
          )}
        </div>
      </main>

      {/* Modal Création Paiement */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Nouveau Paiement
              </h2>
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
                {/* Sélection Membre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Membre
                  </label>
                  <select
                    {...register("memberId")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner un membre</option>
                    {members?.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.memberId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.memberId.message}
                    </p>
                  )}
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Montant (TND)
                  </label>
                  <input
                    {...register("amount", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    step={0.001}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border px-3 py-2"
                    placeholder="50.000"
                    disabled={isSubmitting}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                {/* Mois et Année */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mois couvert
                    </label>
                    <select
                      {...register("monthCovered", { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border px-3 py-2"
                      disabled={isSubmitting}
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i, 1).toLocaleString("fr-FR", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Année
                    </label>
                    <input
                      {...register("yearCovered", { valueAsNumber: true })}
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Numéro de reçu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro de reçu
                  </label>
                  <input
                    {...register("receiptNumber")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border px-3 py-2"
                    placeholder="REC-001"
                    disabled={isSubmitting}
                  />
                  {errors.receiptNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.receiptNumber.message}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes (optionnel)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border px-3 py-2"
                    placeholder="Commentaires sur le paiement..."
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
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Enregistrer le paiement
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

      {/* Receipt PDF Modal */}
      {selectedReceipt && (
        <ReceiptPDF
          data={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
