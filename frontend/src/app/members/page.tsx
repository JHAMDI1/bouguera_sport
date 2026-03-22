"use client";

import { Users, Plus, Edit, UserCircle, Phone, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmModal } from "@/components/ConfirmModal";
import { memberSchema, type MemberFormData } from "@/schemas";
import { useMembers } from "@/features/members/useMembers";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { SearchInput } from "@/components/SearchInput";

export default function MembersPage() {
  const { members, isSubmitting, createMember, updateMember, deleteMember, toggleStatus, modalProps } = useMembers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<MemberFormData>({ resolver: zodResolver(memberSchema) });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<MemberFormData>({ resolver: zodResolver(memberSchema) });

  const filteredMembers = members?.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onCreateSubmit = async (data: MemberFormData) => {
    await createMember(data, () => {
      setIsCreateModalOpen(false);
      resetCreate();
    });
  };

  const onUpdateSubmit = async (data: MemberFormData) => {
    if (!editingMember) return;
    await updateMember(editingMember._id, data, () => {
      setEditingMember(null);
      resetUpdate();
    });
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    resetUpdate({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone || "",
      gender: member.gender || "male",
    });
  };

  const columns: Column<any>[] = [
    {
      header: "Adhérent",
      accessor: (member) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-none bg-primary-subtle flex items-center justify-center mr-3">
            <UserCircle className="h-6 w-6 text-primary-text" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {member.firstName} {member.lastName}
            </div>
            <div className="text-xs text-foreground-secondary capitalize">
              {member.gender === "male" ? "Homme" : "Femme"}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Contact",
      accessor: (member) => member.phone ? (
        <a href={`tel:${member.phone}`} className="text-sm text-foreground flex items-center hover:text-primary-text transition-colors">
          <Phone className="h-4 w-4 mr-1 text-foreground-muted" />
          {member.phone}
        </a>
      ) : null
    },
    {
      header: "Inscription",
      accessor: (member) => (
        <div className="flex items-center text-sm text-foreground-secondary">
          <Calendar className="h-4 w-4 mr-1 text-foreground-muted" />
          {new Date(member.registrationDate).toLocaleDateString("fr-FR")}
        </div>
      )
    },
    {
      header: "Statut",
      accessor: (member) => (
        <StatusBadge
          status={member.isActive}
          onClick={() => toggleStatus(member)}
        />
      )
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (member) => (
        <button
          onClick={() => openEditModal(member)}
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
        title="Gestion des Adhérents"
        icon={<Users className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Adhérent
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <SearchInput
            placeholder="Rechercher un adhérent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DataTable
          data={filteredMembers}
          columns={columns}
          keyExtractor={(m) => m._id}
          isLoading={!members}
          emptyMessage="Aucun adhérent trouvé"
        />
      </main>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvel Adhérent"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitCreate(onCreateSubmit)}
        submitText="Créer"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Prénom" registration={registerCreate("firstName")} error={createErrors.firstName} disabled={isSubmitting} />
          <FormInput label="Nom" registration={registerCreate("lastName")} error={createErrors.lastName} disabled={isSubmitting} />
        </div>
        <FormInput label="Téléphone" registration={registerCreate("phone")} type="tel" placeholder="+216 XX XXX XXX" disabled={isSubmitting} />
        <FormSelect label="Genre" registration={registerCreate("gender")} disabled={isSubmitting}>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
          <option value="other">Autre</option>
        </FormSelect>
      </FormModal>

      <FormModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Modifier Adhérent"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUpdate(onUpdateSubmit)}
        submitText="Mettre à jour"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Prénom" registration={registerUpdate("firstName")} error={updateErrors.firstName} disabled={isSubmitting} />
          <FormInput label="Nom" registration={registerUpdate("lastName")} error={updateErrors.lastName} disabled={isSubmitting} />
        </div>
        <FormInput label="Téléphone" registration={registerUpdate("phone")} type="tel" disabled={isSubmitting} />
        <FormSelect label="Genre" registration={registerUpdate("gender")} disabled={isSubmitting}>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
          <option value="other">Autre</option>
        </FormSelect>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={async () => {
              await deleteMember(editingMember, () => setEditingMember(null));
            }}
            disabled={isSubmitting}
            className="w-full btn btn-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer cet adhérent
          </button>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
