"use client";

import { Users, Plus, Edit, Download, Percent, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmModal } from "@/components/ConfirmModal";
import { exportFamiliesToCSV } from "@/lib/export";
import {
  familySchema,
  updateFamilySchema,
  type FamilyFormData,
  type UpdateFamilyFormData,
} from "@/schemas";
import { useFamilies } from "@/features/families/useFamilies";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";
import { SearchInput } from "@/components/SearchInput";

export default function FamiliesPage() {
  const { families, isSubmitting, createFamily, updateFamily, deleteFamily, toggleStatus, modalProps } = useFamilies();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: { discountPercentage: 0 },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateFamilyFormData>({ resolver: zodResolver(updateFamilySchema) });

  const onCreateSubmit = async (data: FamilyFormData) => {
    await createFamily(data, () => {
      setIsCreateModalOpen(false);
      resetCreate();
    });
  };

  const onUpdateSubmit = async (data: UpdateFamilyFormData) => {
    if (!editingFamily) return;
    await updateFamily(editingFamily._id, data, () => {
      setEditingFamily(null);
      resetUpdate();
    });
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

  const columns: Column<any>[] = [
    {
      header: "Famille",
      accessor: (family) => (
        <div className="flex items-center">
          <Users className="h-5 w-5 text-primary-text mr-2" />
          <span className="text-sm font-medium text-foreground">{family.familyName}</span>
        </div>
      )
    },
    {
      header: "Contact",
      accessor: (family) => (
        <div className="text-sm text-foreground">{family.primaryContactName}</div>
      )
    },
    {
      header: "Téléphone",
      accessor: (family) => family.primaryContactPhone ? (
        <a href={`tel:${family.primaryContactPhone}`} className="text-sm text-foreground flex items-center hover:text-primary-text transition-colors">
          <Phone className="h-4 w-4 mr-1 text-foreground-muted" />
          {family.primaryContactPhone}
        </a>
      ) : (
        <span className="text-foreground-muted text-sm">-</span>
      )
    },
    {
      header: "Réduction",
      accessor: (family) => family.discountPercentage ? (
        <span className="badge badge-success">
          <Percent className="h-3 w-3 mr-1" />
          {family.discountPercentage}%
        </span>
      ) : (
        <span className="text-foreground-muted text-sm">-</span>
      )
    },
    {
      header: "Statut",
      accessor: (family) => (
        <StatusBadge
          status={family.isActive}
          onClick={() => toggleStatus(family)}
          disabled={isSubmitting}
        />
      )
    },
    {
      header: "Actions",
      accessor: (family) => (
        <button
          onClick={() => handleEdit(family)}
          disabled={isSubmitting}
          className="text-primary-text hover:text-primary-active transition-colors disabled:opacity-50 p-2"
        >
          <Edit className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Gestion des Familles"
        icon={<Users className="h-6 w-6" />}
        action={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => families && exportFamiliesToCSV(families)}
              className="btn btn-subtle"
              title="Exporter en CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Famille
            </button>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="max-w-md">
            <SearchInput
              placeholder="Rechercher une famille..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          data={filteredFamilies}
          columns={columns}
          keyExtractor={(f) => f._id}
          isLoading={!families}
          emptyMessage="Aucune famille trouvée"
        />
      </main>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvelle Famille"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitCreate(onCreateSubmit)}
        submitText="Créer"
      >
        <FormInput label="Nom de la famille" registration={registerCreate("familyName")} error={createErrors.familyName} placeholder="Famille Dupont" disabled={isSubmitting} />
        <FormInput label="Nom du contact principal" registration={registerCreate("primaryContactName")} error={createErrors.primaryContactName} placeholder="Jean Dupont" disabled={isSubmitting} />
        <FormInput label="Téléphone" registration={registerCreate("primaryContactPhone")} type="tel" placeholder="+216 XX XXX XXX" disabled={isSubmitting} />
        <FormInput label="Réduction (%)" registration={registerCreate("discountPercentage", { valueAsNumber: true })} error={createErrors.discountPercentage} type="number" min={0} max={100} inputMode="numeric" placeholder="0" disabled={isSubmitting} />
      </FormModal>

      <FormModal
        isOpen={!!editingFamily}
        onClose={() => setEditingFamily(null)}
        title="Modifier Famille"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUpdate(onUpdateSubmit)}
        submitText="Mettre à jour"
      >
        <FormInput label="Nom de la famille" registration={registerUpdate("familyName")} error={updateErrors.familyName} disabled={isSubmitting} />
        <FormInput label="Nom du contact principal" registration={registerUpdate("primaryContactName")} error={updateErrors.primaryContactName} disabled={isSubmitting} />
        <FormInput label="Téléphone" registration={registerUpdate("primaryContactPhone")} type="tel" disabled={isSubmitting} />
        <FormInput label="Réduction (%)" registration={registerUpdate("discountPercentage", { valueAsNumber: true })} error={updateErrors.discountPercentage} type="number" min={0} max={100} inputMode="numeric" disabled={isSubmitting} />

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...registerUpdate("isActive")} type="checkbox" className="rounded-none border-2 border-border text-primary-text" disabled={isSubmitting} />
            <span className="text-sm text-foreground-secondary">Famille active</span>
          </label>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={async () => {
              await deleteFamily(editingFamily, () => setEditingFamily(null));
            }}
            disabled={isSubmitting}
            className="w-full btn btn-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer cette famille
          </button>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
