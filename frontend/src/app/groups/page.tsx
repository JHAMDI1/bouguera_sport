"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Plus, Edit, X, Check, Calendar, UserCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastHelpers } from "@/components/Toast";
import { ConfirmModal, useConfirmModal } from "@/components/ConfirmModal";

const groupSchema = z.object({
  name: z.string().min(2, "Nom du groupe requis"),
  disciplineId: z.string().min(1, "Discipline requise"),
  coachId: z.string().min(1, "Coach requis"),
  schedule: z.string().optional(),
  maxCapacity: z.number().min(1, "Capacité minimale de 1"),
});

const updateGroupSchema = z.object({
  name: z.string().min(2, "Nom du groupe requis"),
  disciplineId: z.string().min(1, "Discipline requise"),
  coachId: z.string().min(1, "Coach requis"),
  schedule: z.string().optional(),
  maxCapacity: z.number().min(1, "Capacité minimale de 1"),
  isActive: z.boolean(),
});

type GroupFormData = z.infer<typeof groupSchema>;
type UpdateGroupFormData = z.infer<typeof updateGroupSchema>;

export default function GroupsPage() {
  const groups = useQuery(api.disciplines.getGroups, {});
  const disciplines = useQuery(api.disciplines.getDisciplines, {});
  const coaches = useQuery(api.users.getUsers, { role: "coach" });
  const createGroup = useMutation(api.coaches.createGroup);
  const updateGroup = useMutation(api.coaches.updateGroup);
  const toast = useToastHelpers();
  const { confirm, modalProps } = useConfirmModal();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      maxCapacity: 20,
    },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateGroupFormData>({
    resolver: zodResolver(updateGroupSchema),
  });

  const onCreateSubmit = async (data: GroupFormData) => {
    setIsSubmitting(true);
    try {
      await createGroup({
        ...data,
        disciplineId: data.disciplineId as any,
        coachId: data.coachId as any,
      });
      toast.success("Groupe créé", `${data.name} a été créé avec succès`);
      setIsCreateModalOpen(false);
      resetCreate();
    } catch (error) {
      console.error("Erreur création groupe:", error);
      toast.error("Erreur", "Impossible de créer le groupe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateSubmit = async (data: UpdateGroupFormData) => {
    if (!editingGroup) return;
    setIsSubmitting(true);
    try {
      await updateGroup({
        id: editingGroup._id,
        ...data,
        disciplineId: data.disciplineId as any,
        coachId: data.coachId as any,
      });
      toast.success("Groupe mis à jour", "Les informations ont été modifiées avec succès");
      setEditingGroup(null);
      resetUpdate();
    } catch (error) {
      console.error("Erreur mise à jour groupe:", error);
      toast.error("Erreur", "Impossible de mettre à jour le groupe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (group: any) => {
    setEditingGroup(group);
    resetUpdate({
      name: group.name,
      disciplineId: group.disciplineId,
      coachId: group.coachId,
      schedule: group.schedule || "",
      maxCapacity: group.maxCapacity,
      isActive: group.isActive,
    });
  };

  const getDisciplineName = (id: string) => {
    return disciplines?.find((d) => d._id === id)?.name || "Inconnu";
  };

  const getCoachName = (id: string) => {
    return coaches?.find((c) => c._id === id)?.fullName || "Inconnu";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-[4px_4px_0px_var(--color-foreground)] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des Groupes
              </h1>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-black text-white px-4 py-2 rounded-none-none flex items-center hover:bg-primary-hover hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Groupe
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-none-none shadow-[4px_4px_0px_var(--color-foreground)] overflow-hidden">
          <table className="min-w-full divide-y-2-2 divide-foreground">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Groupe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Discipline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Horaires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Capacité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-foreground">
              {groups?.map((group) => (
                <tr key={group._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {group.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-none-none bg-purple-100 text-purple-800">
                      {getDisciplineName(group.disciplineId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <UserCircle className="h-4 w-4 mr-1 text-gray-500" />
                      {getCoachName(group.coachId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {group.schedule || "Non défini"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {group.maxCapacity} places
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-none-none ${
                        group.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {group.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openEditModal(group)}
                      className="text-primary hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!groups && (
            <div className="text-center py-8 text-gray-700">Chargement...</div>
          )}
          {groups?.length === 0 && (
            <div className="text-center py-8 text-gray-700">
              Aucun groupe trouvé
            </div>
          )}
        </div>
      </main>

      {/* Modal Création */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none-none p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Nouveau Groupe
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate(onCreateSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom du groupe
                  </label>
                  <input
                    {...registerCreate("name")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    placeholder="Taekwondo - Enfants 8-12 ans"
                    disabled={isSubmitting}
                  />
                  {createErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discipline
                  </label>
                  <select
                    {...registerCreate("disciplineId")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner une discipline</option>
                    {disciplines?.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {createErrors.disciplineId && (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.disciplineId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coach
                  </label>
                  <select
                    {...registerCreate("coachId")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner un coach</option>
                    {coaches?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                  {createErrors.coachId && (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.coachId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Horaires
                  </label>
                  <input
                    {...registerCreate("schedule")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    placeholder="Lundi/Mercredi 18h-20h"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacité maximale
                  </label>
                  <input
                    {...registerCreate("maxCapacity", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {createErrors.maxCapacity && (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.maxCapacity.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border-2 border-foreground border-2 border-foreground rounded-none-none text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-black text-white rounded-none-none hover:bg-primary-hover hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
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
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none-none p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Modifier Groupe
              </h2>
              <button
                onClick={() => setEditingGroup(null)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate(onUpdateSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom du groupe
                  </label>
                  <input
                    {...registerUpdate("name")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {updateErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {updateErrors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discipline
                  </label>
                  <select
                    {...registerUpdate("disciplineId")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner une discipline</option>
                    {disciplines?.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {updateErrors.disciplineId && (
                    <p className="mt-1 text-sm text-red-600">
                      {updateErrors.disciplineId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coach
                  </label>
                  <select
                    {...registerUpdate("coachId")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner un coach</option>
                    {coaches?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                  {updateErrors.coachId && (
                    <p className="mt-1 text-sm text-red-600">
                      {updateErrors.coachId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Horaires
                  </label>
                  <input
                    {...registerUpdate("schedule")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacité maximale
                  </label>
                  <input
                    {...registerUpdate("maxCapacity", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {updateErrors.maxCapacity && (
                    <p className="mt-1 text-sm text-red-600">
                      {updateErrors.maxCapacity.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      {...registerUpdate("isActive")}
                      type="checkbox"
                      className="rounded-none border-2 border-foreground text-primary focus:ring-indigo-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-sm text-gray-700">Actif</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border-2 border-foreground border-2 border-foreground rounded-none-none text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-black text-white rounded-none-none hover:bg-primary-hover hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
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
