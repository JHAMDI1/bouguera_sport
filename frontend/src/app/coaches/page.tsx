"use client";

import { UserCircle, Plus, Edit, Phone, Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  coachSchema,
  updateCoachSchema,
  type CoachFormData,
  type UpdateCoachFormData,
} from "@/schemas";
import { useCoaches } from "@/features/coaches/useCoaches";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";

export default function CoachesPage() {
  const { coaches, isSubmitting, createCoach, updateCoach, deleteCoach, toggleStatus, modalProps } = useCoaches();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CoachFormData>({ resolver: zodResolver(coachSchema) });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateCoachFormData>({ resolver: zodResolver(updateCoachSchema) });

  const onCreateSubmit = async (data: CoachFormData) => {
    await createCoach(data, () => {
      setIsCreateModalOpen(false);
      resetCreate();
    });
  };

  const onUpdateSubmit = async (data: UpdateCoachFormData) => {
    if (!editingCoach) return;
    await updateCoach(editingCoach._id, data, () => {
      setEditingCoach(null);
      resetUpdate();
    });
  };

  const openEditModal = (coach: any) => {
    setEditingCoach(coach);
    resetUpdate({ fullName: coach.fullName, phone: coach.phone || "", isActive: coach.isActive });
  };

  const columns: Column<any>[] = [
    {
      header: "Coach",
      accessor: (coach) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-none bg-primary-subtle flex items-center justify-center">
            <UserCircle className="h-6 w-6 text-primary-text" />
          </div>
          <div className="ml-4 text-sm font-medium text-foreground">{coach.fullName}</div>
        </div>
      )
    },
    {
      header: "Contact",
      accessor: (coach) => (
        <>
          <div className="text-sm text-foreground flex items-center">
            <Mail className="h-4 w-4 mr-1 text-foreground-muted" />
            {coach.email}
          </div>
          {coach.phone && (
            <a href={`tel:${coach.phone}`} className="text-sm text-foreground-secondary flex items-center mt-1 hover:text-primary-text transition-colors">
              <Phone className="h-4 w-4 mr-1 text-foreground-muted" />
              {coach.phone}
            </a>
          )}
        </>
      )
    },
    {
      header: "Statut",
      accessor: (coach) => (
        <StatusBadge
          status={coach.isActive}
          onClick={() => toggleStatus(coach)}
        />
      )
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (coach) => (
        <button
          onClick={() => openEditModal(coach)}
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
        title="Gestion des Coachs"
        icon={<UserCircle className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Coach
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DataTable
          data={coaches}
          columns={columns}
          keyExtractor={(c) => c._id}
          isLoading={!coaches}
          emptyMessage="Aucun coach trouvé"
        />
      </main>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouveau Coach"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitCreate(onCreateSubmit)}
        submitText="Créer"
      >
        <FormInput label="ID Clerk" registration={registerCreate("clerkId")} error={createErrors.clerkId} placeholder="user_xxx" disabled={isSubmitting} />
        <FormInput label="Email" registration={registerCreate("email")} error={createErrors.email} type="email" placeholder="coach@example.com" disabled={isSubmitting} />
        <FormInput label="Nom complet" registration={registerCreate("fullName")} error={createErrors.fullName} placeholder="John Doe" disabled={isSubmitting} />
        <FormInput label="Téléphone" registration={registerCreate("phone")} type="tel" placeholder="+216 XX XXX XXX" disabled={isSubmitting} />
      </FormModal>

      <FormModal
        isOpen={!!editingCoach}
        onClose={() => setEditingCoach(null)}
        title="Modifier Coach"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUpdate(onUpdateSubmit)}
        submitText="Mettre à jour"
      >
        <FormInput label="Nom complet" registration={registerUpdate("fullName")} error={updateErrors.fullName} disabled={isSubmitting} />
        <FormInput label="Téléphone" registration={registerUpdate("phone")} type="tel" disabled={isSubmitting} />

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
              await deleteCoach(editingCoach, () => setEditingCoach(null));
            }}
            disabled={isSubmitting}
            className="w-full btn btn-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer ce coach
          </button>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
