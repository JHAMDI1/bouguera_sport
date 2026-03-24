"use client";

import { Activity, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDisciplines } from "@/features/disciplines/useDisciplines";
import { disciplineSchema, updateDisciplineSchema, type DisciplineFormData, type UpdateDisciplineFormData } from "@/schemas";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Doc } from "../../../convex/_generated/dataModel";

export default function DisciplinesPage() {
  const {
    disciplines,
    isSubmitting,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,
    toggleStatus,
    modalProps,
  } = useDisciplines();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Doc<"disciplines"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<DisciplineFormData>({
    resolver: zodResolver(disciplineSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateDisciplineFormData>({
    resolver: zodResolver(updateDisciplineSchema),
  });

  const onCreateSubmit = async (data: DisciplineFormData) => {
    await createDiscipline(data, () => {
      setIsCreateModalOpen(false);
      resetCreate();
    });
  };

  const onUpdateSubmit = async (data: UpdateDisciplineFormData) => {
    if (!editingDiscipline) return;
    await updateDiscipline(editingDiscipline._id, data, () => {
      setEditingDiscipline(null);
      resetUpdate();
    });
  };

  const handleEdit = (discipline: Doc<"disciplines">) => {
    setEditingDiscipline(discipline);
    resetUpdate({
      name: discipline.name,
      description: discipline.description || "",
      monthlyFee: discipline.monthlyFee,
      isActive: discipline.isActive,
    });
  };

  const handleDelete = async (discipline: Doc<"disciplines">) => {
    await deleteDiscipline(discipline, () => {
      setEditingDiscipline(null);
    });
  };

  const filteredDisciplines = disciplines?.filter((d) => {
    if (!searchTerm) return true;
    return d.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns: Column<Doc<"disciplines">>[] = [
    {
      header: "Nom",
      accessor: (discipline) => (
        <span className="font-medium text-foreground">{discipline.name}</span>
      ),
    },
    {
      header: "Tarif",
      accessor: (discipline) => (
        <span className="font-medium text-primary-text">{discipline.monthlyFee} TND <span className="text-foreground-secondary text-sm font-normal">/mois</span></span>
      ),
    },
    {
      header: "Description",
      accessor: (discipline) => (
        <span className="text-foreground-secondary text-sm max-w-[200px] truncate block" title={discipline.description}>
          {discipline.description || "Aucune description"}
        </span>
      ),
    },
    {
      header: "Statut",
      accessor: (discipline) => (
        <StatusBadge
          status={discipline.isActive}
          onClick={() => toggleStatus(discipline)}
          disabled={isSubmitting}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (discipline) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEdit(discipline)}
            className="text-primary-text hover:text-primary-active transition-colors p-2"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const DisciplineFormFields = ({ registerFn, errors }: { registerFn: any; errors: any }) => (
    <>
      <FormInput
        label="Nom de la discipline"
        registration={registerFn("name")}
        error={errors.name}
        placeholder="Ex: Natation"
        disabled={isSubmitting}
      />

      <FormInput
        label="Tarif mensuel (TND)"
        registration={registerFn("monthlyFee", { valueAsNumber: true })}
        error={errors.monthlyFee}
        type="number"
        min={0}
        step={0.1}
        inputMode="numeric"
        placeholder="50.00"
        disabled={isSubmitting}
      />

      <div>
        <label className="block text-sm font-medium text-foreground-secondary mb-1">
          Description (optionnelle)
        </label>
        <textarea
          {...registerFn("description")}
          rows={3}
          className="input w-full"
          placeholder="Détails de la discipline..."
          disabled={isSubmitting}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Disciplines & Tarifs"
        showBack={true}
        icon={<Activity className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle Discipline</span>
          </button>
        }
      >
        <div className="text-right mr-4 hidden md:block">
          <p className="text-sm text-foreground-secondary">Total Disciplines</p>
          <p className="text-xl font-bold text-foreground">
            {disciplines?.length || 0}
          </p>
        </div>
      </PageHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 max-w-md">
          <SearchInput
            placeholder="Rechercher une discipline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DataTable
          data={filteredDisciplines}
          columns={columns}
          keyExtractor={(d) => d._id}
          isLoading={!disciplines}
          emptyMessage="Aucune discipline trouvée"
        />
      </main>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvelle Discipline"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitCreate(onCreateSubmit)}
        submitText="Créer la discipline"
      >
        <DisciplineFormFields registerFn={registerCreate} errors={createErrors} />
      </FormModal>

      <FormModal
        isOpen={!!editingDiscipline}
        onClose={() => setEditingDiscipline(null)}
        title="Modifier Discipline"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUpdate(onUpdateSubmit)}
        submitText="Enregistrer les modifications"
      >
        <DisciplineFormFields registerFn={registerUpdate} errors={updateErrors} />

        <div className="flex items-center mt-4 mb-4">
          <input
            type="checkbox"
            id="isActive"
            {...registerUpdate("isActive")}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-foreground">
            Discipline active
          </label>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => handleDelete(editingDiscipline!)}
            disabled={isSubmitting}
            className="w-full btn btn-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer cette discipline
          </button>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
