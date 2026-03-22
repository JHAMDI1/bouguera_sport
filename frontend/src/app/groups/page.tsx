"use client";

import { Users, Plus, Edit, Calendar, UserCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  groupSchema,
  updateGroupSchema,
  type GroupFormData,
  type UpdateGroupFormData,
} from "@/schemas";
import { useGroups } from "@/features/groups/useGroups";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { getDisciplineName, getCoachName } from "@/lib/lookups";

export default function GroupsPage() {
  const { groups, disciplines, coaches, isSubmitting, createGroup, updateGroup, deleteGroup, toggleStatus, modalProps } = useGroups();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<GroupFormData>({ resolver: zodResolver(groupSchema), defaultValues: { maxCapacity: 20 } });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateGroupFormData>({ resolver: zodResolver(updateGroupSchema) });

  const onCreateSubmit = async (data: GroupFormData) => {
    await createGroup(data, () => {
      setIsCreateModalOpen(false);
      resetCreate();
    });
  };

  const onUpdateSubmit = async (data: UpdateGroupFormData) => {
    if (!editingGroup) return;
    await updateGroup(editingGroup._id, data, () => {
      setEditingGroup(null);
      resetUpdate();
    });
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

  const columns: Column<any>[] = [
    {
      header: "Groupe",
      accessor: (group) => <span className="text-sm font-medium text-foreground">{group.name}</span>
    },
    {
      header: "Discipline",
      accessor: (group) => <span className="badge badge-info">{getDisciplineName(disciplines, group.disciplineId)}</span>
    },
    {
      header: "Coach",
      accessor: (group) => (
        <div className="flex items-center text-sm text-foreground">
          <UserCircle className="h-4 w-4 mr-1 text-foreground-muted" />
          {getCoachName(coaches, group.coachId)}
        </div>
      )
    },
    {
      header: "Horaires",
      accessor: (group) => (
        <div className="flex items-center text-sm text-foreground-secondary">
          <Calendar className="h-4 w-4 mr-1 text-foreground-muted" />
          {group.schedule || "Non défini"}
        </div>
      )
    },
    {
      header: "Capacité",
      accessor: (group) => <span className="text-sm text-foreground">{group.maxCapacity} places</span>
    },
    {
      header: "Statut",
      accessor: (group) => (
        <StatusBadge
          status={group.isActive}
          onClick={() => toggleStatus(group)}
          disabled={isSubmitting}
        />
      )
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (group) => (
        <button
          onClick={() => openEditModal(group)}
          className="text-primary-text hover:text-primary-active transition-colors p-2"
        >
          <Edit className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Gestion des Groupes"
        icon={<Users className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Groupe
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DataTable
          data={groups}
          columns={columns}
          keyExtractor={(g) => g._id}
          isLoading={!groups}
          emptyMessage="Aucun groupe trouvé"
        />
      </main>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouveau Groupe"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitCreate(onCreateSubmit)}
        submitText="Créer"
      >
        <FormInput label="Nom du groupe" registration={registerCreate("name")} error={createErrors.name} placeholder="Taekwondo - Enfants 8-12 ans" disabled={isSubmitting} />
        <FormSelect label="Discipline" registration={registerCreate("disciplineId")} error={createErrors.disciplineId} disabled={isSubmitting}>
          <option value="">Sélectionner une discipline</option>
          {disciplines?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </FormSelect>
        <FormSelect label="Coach" registration={registerCreate("coachId")} error={createErrors.coachId} disabled={isSubmitting}>
          <option value="">Sélectionner un coach</option>
          {coaches?.map((c) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
        </FormSelect>
        <FormInput label="Horaires" registration={registerCreate("schedule")} placeholder="Lundi/Mercredi 18h-20h" disabled={isSubmitting} />
        <FormInput label="Capacité maximale" registration={registerCreate("maxCapacity", { valueAsNumber: true })} error={createErrors.maxCapacity} type="number" min={1} inputMode="numeric" disabled={isSubmitting} />
      </FormModal>

      <FormModal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        title="Modifier Groupe"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUpdate(onUpdateSubmit)}
        submitText="Mettre à jour"
      >
        <FormInput label="Nom du groupe" registration={registerUpdate("name")} error={updateErrors.name} disabled={isSubmitting} />
        <FormSelect label="Discipline" registration={registerUpdate("disciplineId")} error={updateErrors.disciplineId} disabled={isSubmitting}>
          <option value="">Sélectionner une discipline</option>
          {disciplines?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </FormSelect>
        <FormSelect label="Coach" registration={registerUpdate("coachId")} error={updateErrors.coachId} disabled={isSubmitting}>
          <option value="">Sélectionner un coach</option>
          {coaches?.map((c) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
        </FormSelect>
        <FormInput label="Horaires" registration={registerUpdate("schedule")} disabled={isSubmitting} />
        <FormInput label="Capacité maximale" registration={registerUpdate("maxCapacity", { valueAsNumber: true })} error={updateErrors.maxCapacity} type="number" min={1} inputMode="numeric" disabled={isSubmitting} />

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...registerUpdate("isActive")} type="checkbox" className="rounded-none border-2 border-border text-primary-text" disabled={isSubmitting} />
            <span className="text-sm text-foreground-secondary">Actif</span>
          </label>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={async () => {
              await deleteGroup(editingGroup, () => setEditingGroup(null));
            }}
            disabled={isSubmitting}
            className="w-full btn btn-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer ce groupe
          </button>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
