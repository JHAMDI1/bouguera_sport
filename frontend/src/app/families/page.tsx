"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Plus, Edit, X, Check, Search, Phone, Loader2, Download, Percent } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastHelpers } from "@/components/Toast";
import { ConfirmModal, useConfirmModal } from "@/components/ConfirmModal";
import { exportFamiliesToCSV } from "@/lib/export";

const familySchema = z.object({
  familyName: z.string().min(1, "Nom de famille requis"),
  primaryContactName: z.string().min(1, "Nom du contact requis"),
  primaryContactPhone: z.string().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
});

const updateFamilySchema = familySchema.extend({
  isActive: z.boolean(),
});

type FamilyFormData = z.infer<typeof familySchema>;
type UpdateFamilyFormData = z.infer<typeof updateFamilySchema>;

export default function FamiliesPage() {
  const families = useQuery(api.families.getFamilies, {});
  const createFamily = useMutation(api.families.createFamily);
  const updateFamily = useMutation(api.families.updateFamily);
  const toast = useToastHelpers();
  const { confirm, modalProps } = useConfirmModal();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      discountPercentage: 0,
    },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateFamilyFormData>({
    resolver: zodResolver(updateFamilySchema),
  });

  const onCreateSubmit = async (data: FamilyFormData) => {
    setIsSubmitting(true);
    try {
      await createFamily({
        ...data,
        discountPercentage: data.discountPercentage || undefined,
      });
      toast.success("Famille créée", `${data.familyName} a été créée avec succès`);
      setIsCreateModalOpen(false);
      resetCreate();
    } catch (error) {
      console.error("Erreur création famille:", error);
      toast.error("Erreur", "Impossible de créer la famille");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateSubmit = async (data: UpdateFamilyFormData) => {
    if (!editingFamily) return;
    setIsSubmitting(true);
    try {
      await updateFamily({
        id: editingFamily._id,
        ...data,
        discountPercentage: data.discountPercentage || undefined,
      });
      toast.success("Famille mise à jour", "Les informations ont été modifiées avec succès");
      setEditingFamily(null);
      resetUpdate();
    } catch (error) {
      console.error("Erreur mise à jour famille:", error);
      toast.error("Erreur", "Impossible de mettre à jour la famille");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (family: any) => {
    const newStatus = !family.isActive;
    const confirmed = await confirm({
      title: newStatus ? "Activer la famille" : "Désactiver la famille",
      message: `Êtes-vous sûr de vouloir ${newStatus ? "activer" : "désactiver"} ${family.familyName} ?`,
      type: newStatus ? "info" : "warning",
    });

    if (confirmed) {
      setIsSubmitting(true);
      try {
        await updateFamily({
          id: family._id,
          familyName: family.familyName,
          primaryContactName: family.primaryContactName,
          primaryContactPhone: family.primaryContactPhone,
          discountPercentage: family.discountPercentage,
          isActive: newStatus,
        });
        toast.success(
          newStatus ? "Famille activée" : "Famille désactivée",
          `${family.familyName} est maintenant ${newStatus ? "active" : "inactive"}`
        );
      } catch (error) {
        console.error("Erreur changement statut:", error);
        toast.error("Erreur", "Impossible de changer le statut");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEdit = (family: any) => {
    setEditingFamily(family);
    resetUpdate({
      familyName: family.familyName,
      primaryContactName: family.primaryContactName,
      primaryContactPhone: family.primaryContactPhone || "",
      discountPercentage: family.discountPercentage || 0,
      isActive: family.isActive,
    });
  };

  const filteredFamilies = families?.filter((f) =>
    searchTerm
      ? f.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.primaryContactName.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-[4px_4px_0px_var(--color-foreground)] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Familles</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => families && exportFamiliesToCSV(families)}
                className="bg-gray-600 text-white px-4 py-2 rounded-none-none flex items-center hover:bg-gray-700"
                title="Exporter en CSV"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary text-black text-white px-4 py-2 rounded-none-none flex items-center hover:bg-primary-hover hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Famille
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher une famille..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2 border-2 border-foreground border-2 border-foreground rounded-none-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Families Table */}
        <div className="bg-white rounded-none-none shadow-[4px_4px_0px_var(--color-foreground)] overflow-hidden">
          <table className="min-w-full divide-y-2-2 divide-foreground">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Famille</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Réduction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-foreground">
              {filteredFamilies?.map((family) => (
                <tr key={family._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-gray-900">{family.familyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {family.primaryContactName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {family.primaryContactPhone ? (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-500" />
                        {family.primaryContactPhone}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {family.discountPercentage ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-none-none bg-green-100 text-green-800">
                        <Percent className="h-3 w-3 mr-1" />
                        {family.discountPercentage}%
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(family)}
                      disabled={isSubmitting}
                      className={`px-2 py-1 text-xs rounded-none-none ${
                        family.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      } disabled:opacity-50`}
                    >
                      {family.isActive ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(family)}
                      disabled={isSubmitting}
                      className="text-primary hover:text-indigo-900 mr-3 disabled:opacity-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!families && (
            <div className="text-center py-8 text-gray-700">Chargement...</div>
          )}
          {filteredFamilies?.length === 0 && (
            <div className="text-center py-8 text-gray-700">Aucune famille trouvée</div>
          )}
        </div>
      </main>

      {/* Modal Création */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none-none p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Famille</h2>
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
                  <label className="block text-sm font-medium text-gray-700">Nom de la famille</label>
                  <input
                    {...registerCreate("familyName")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    placeholder="Famille Dupont"
                    disabled={isSubmitting}
                  />
                  {createErrors.familyName && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.familyName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du contact principal</label>
                  <input
                    {...registerCreate("primaryContactName")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    placeholder="Jean Dupont"
                    disabled={isSubmitting}
                  />
                  {createErrors.primaryContactName && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.primaryContactName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    {...registerCreate("primaryContactPhone")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    placeholder="+216 XX XXX XXX"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Réduction (%)
                  </label>
                  <input
                    {...registerCreate("discountPercentage", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                  {createErrors.discountPercentage && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.discountPercentage.message}</p>
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
      {editingFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none-none p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Modifier Famille</h2>
              <button
                onClick={() => setEditingFamily(null)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate(onUpdateSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom de la famille</label>
                  <input
                    {...registerUpdate("familyName")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {updateErrors.familyName && (
                    <p className="mt-1 text-sm text-red-600">{updateErrors.familyName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du contact principal</label>
                  <input
                    {...registerUpdate("primaryContactName")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {updateErrors.primaryContactName && (
                    <p className="mt-1 text-sm text-red-600">{updateErrors.primaryContactName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    {...registerUpdate("primaryContactPhone")}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Réduction (%)</label>
                  <input
                    {...registerUpdate("discountPercentage", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 block w-full rounded-none-none border-2 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] focus:border-indigo-500 focus:ring-indigo-500 border-2 border-foreground px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {updateErrors.discountPercentage && (
                    <p className="mt-1 text-sm text-red-600">{updateErrors.discountPercentage.message}</p>
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
                    <span className="ml-2 text-sm text-gray-700">Famille active</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingFamily(null)}
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
