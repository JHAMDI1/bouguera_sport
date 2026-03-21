"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UserCircle, Plus, Edit, X, Check, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastHelpers } from "@/components/Toast";
import { ConfirmModal, useConfirmModal } from "@/components/ConfirmModal";

const coachSchema = z.object({
  clerkId: z.string().min(1, "ID Clerk requis"),
  email: z.string().email("Email invalide"),
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z.string().optional(),
});

const updateCoachSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

type CoachFormData = z.infer<typeof coachSchema>;
type UpdateCoachFormData = z.infer<typeof updateCoachSchema>;

export default function CoachesPage() {
  const coaches = useQuery(api.users.getUsers, { role: "coach" });
  const createCoach = useMutation(api.coaches.createCoach);
  const updateCoach = useMutation(api.coaches.updateCoach);
  const toast = useToastHelpers();
  const { confirm, modalProps } = useConfirmModal();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CoachFormData>({
    resolver: zodResolver(coachSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateCoachFormData>({
    resolver: zodResolver(updateCoachSchema),
  });

  const onCreateSubmit = async (data: CoachFormData) => {
    setIsSubmitting(true);
    try {
      await createCoach(data);
      toast.success("Coach créé", `${data.fullName} a été ajouté avec succès`);
      setIsCreateModalOpen(false);
      resetCreate();
    } catch (error) {
      console.error("Erreur création coach:", error);
      toast.error("Erreur", "Impossible de créer le coach");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateSubmit = async (data: UpdateCoachFormData) => {
    if (!editingCoach) return;
    setIsSubmitting(true);
    try {
      await updateCoach({ id: editingCoach._id, ...data });
      toast.success("Coach mis à jour", "Les informations ont été modifiées avec succès");
      setEditingCoach(null);
      resetUpdate();
    } catch (error) {
      console.error("Erreur mise à jour coach:", error);
      toast.error("Erreur", "Impossible de mettre à jour le coach");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (coach: any) => {
    const newStatus = !coach.isActive;
    const confirmed = await confirm({
      title: newStatus ? "Activer le coach ?" : "Désactiver le coach ?",
      message: `Êtes-vous sûr de vouloir ${newStatus ? "activer" : "désactiver"} ${coach.fullName} ?`,
      type: newStatus ? "success" : "warning",
      confirmText: newStatus ? "Activer" : "Désactiver",
    });

    if (confirmed) {
      try {
        await updateCoach({ id: coach._id, isActive: newStatus });
        toast.success(
          newStatus ? "Coach activé" : "Coach désactivé",
          `${coach.fullName} est maintenant ${newStatus ? "actif" : "inactif"}`
        );
      } catch (error) {
        console.error("Erreur changement statut:", error);
        toast.error("Erreur", "Impossible de modifier le statut");
      }
    }
  };

  const openEditModal = (coach: any) => {
    setEditingCoach(coach);
    resetUpdate({
      fullName: coach.fullName,
      phone: coach.phone || "",
      isActive: coach.isActive,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCircle className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Coachs</h1>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Coach
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coaches?.map((coach) => (
                <tr key={coach._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {coach.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      {coach.email}
                    </div>
                    {coach.phone && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {coach.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(coach)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        coach.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {coach.isActive ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openEditModal(coach)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!coaches && (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          )}
          {coaches?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun coach trouvé
            </div>
          )}
        </div>
      </main>

      {/* Modal Création */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Nouveau Coach
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate(onCreateSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID Clerk
                  </label>
                  <input
                    {...registerCreate("clerkId")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                    placeholder="user_xxx"
                    disabled={isSubmitting}
                  />
                  {createErrors.clerkId && (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.clerkId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    {...registerCreate("email")}
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                    placeholder="coach@example.com"
                    disabled={isSubmitting}
                  />
                  {createErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <input
                    {...registerCreate("fullName")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                  {createErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <input
                    {...registerCreate("phone")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                    placeholder="+216 XX XXX XXX"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Création...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Créer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {editingCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Modifier Coach
              </h2>
              <button
                onClick={() => setEditingCoach(null)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate(onUpdateSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <input
                    {...registerUpdate("fullName")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {updateErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {updateErrors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <input
                    {...registerUpdate("phone")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      {...registerUpdate("isActive")}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-sm text-gray-700">Actif</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingCoach(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Mise à jour...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Mettre à jour
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
