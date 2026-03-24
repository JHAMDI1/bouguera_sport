"use client";

import { Calendar, Plus, Clock, MapPin, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmModal } from "@/components/ConfirmModal";
import { sessionSchema, type SessionFormData } from "@/schemas";
import { useSchedule } from "@/features/schedule/useSchedule";
import { PageHeader } from "@/components/PageHeader";
import { FormModal } from "@/components/FormModal";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

export default function SchedulePage() {
  const {
    groups,
    coaches,
    selectedWeek,
    weekStart,
    scheduleByDay,
    isSubmitting,
    createSession,
    updateSession,
    deleteSession,
    formatTime,
    navigateWeek,
    modalProps,
  } = useSchedule();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { dayOfWeek: 1, startHour: 18, startMinute: 0, endHour: 19, endMinute: 30, isRecurring: true },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<SessionFormData>({ resolver: zodResolver(sessionSchema) });

  const onCreateSubmit = async (data: SessionFormData) => {
    await createSession(data, () => {
      setIsCreateModalOpen(false);
      resetCreate();
    });
  };

  const onUpdateSubmit = async (data: SessionFormData) => {
    if (!editingSession) return;
    await updateSession(editingSession._id, data, () => {
      setEditingSession(null);
      resetUpdate();
    });
  };

  const handleEdit = (session: any) => {
    setEditingSession(session);
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);
    resetUpdate({
      groupId: session.groupId,
      coachId: session.coachId,
      title: session.title,
      dayOfWeek: session.dayOfWeek,
      startHour: startDate.getHours(),
      startMinute: startDate.getMinutes(),
      endHour: endDate.getHours(),
      endMinute: endDate.getMinutes(),
      location: session.location || "",
      notes: session.notes || "",
      isRecurring: session.isRecurring || false,
    });
  };

  const handleDelete = async (session: any) => {
    await deleteSession(session, () => {
      setEditingSession(null);
    });
  };

  const SessionFormFields = ({ registerFn, errors }: { registerFn: any; errors: any }) => (
    <div className="space-y-4">
      <FormInput label="Titre" registration={registerFn("title")} error={errors.title} placeholder="Taekwondo - Enfants" disabled={isSubmitting} />

      <FormSelect label="Groupe" registration={registerFn("groupId")} error={errors.groupId} disabled={isSubmitting}>
        <option value="">Sélectionner un groupe</option>
        {groups?.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
      </FormSelect>

      <FormSelect label="Coach" registration={registerFn("coachId")} error={errors.coachId} disabled={isSubmitting}>
        <option value="">Sélectionner un coach</option>
        {coaches?.map((c) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
      </FormSelect>

      <FormSelect label="Jour" registration={registerFn("dayOfWeek", { valueAsNumber: true })} disabled={isSubmitting}>
        {DAYS.map((day, index) => <option key={index} value={index}>{day}</option>)}
      </FormSelect>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1">Heure début</label>
          <div className="flex space-x-2">
            <select {...registerFn("startHour", { valueAsNumber: true })} className="input w-full" disabled={isSubmitting}>
              {HOURS.map((h) => <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>)}
            </select>
            <select {...registerFn("startMinute", { valueAsNumber: true })} className="input w-full" disabled={isSubmitting}>
              <option value={0}>00</option><option value={15}>15</option>
              <option value={30}>30</option><option value={45}>45</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1">Heure fin</label>
          <div className="flex space-x-2">
            <select {...registerFn("endHour", { valueAsNumber: true })} className="input w-full" disabled={isSubmitting}>
              {HOURS.map((h) => <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>)}
            </select>
            <select {...registerFn("endMinute", { valueAsNumber: true })} className="input w-full" disabled={isSubmitting}>
              <option value={0}>00</option><option value={15}>15</option>
              <option value={30}>30</option><option value={45}>45</option>
            </select>
          </div>
        </div>
      </div>

      <FormInput label="Lieu" registration={registerFn("location")} placeholder="Salle principale" disabled={isSubmitting} />

      <div>
        <label className="block text-sm font-medium text-foreground-secondary mb-1">Notes</label>
        <textarea {...registerFn("notes")} className="input w-full" rows={3} disabled={isSubmitting} />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input {...registerFn("isRecurring")} type="checkbox" className="rounded-none border-2 border-border text-primary-text" disabled={isSubmitting} />
          <span className="text-sm text-foreground-secondary">Séance récurrente (hebdomadaire)</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Planning des Cours"
        showBack={true}
        icon={<Calendar className="h-6 w-6" />}
        action={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle Séance</span>
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="flex items-center mb-6 space-x-4">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-background-tertiary rounded-none transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-lg font-medium text-foreground">
            Semaine du {weekStart.toLocaleDateString("fr-FR")}
          </span>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-background-tertiary rounded-none transition-colors">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-background-elevated rounded-none shadow-[4px_4px_0px_var(--color-foreground)] overflow-hidden border-2 border-border">
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-3 border-r border-border bg-background-secondary font-medium text-foreground-secondary">Heure</div>
            {DAYS.map((day, index) => (
              <div
                key={day}
                className={`p-3 text-center font-medium ${index === new Date().getDay()
                  ? "bg-primary-subtle text-primary-text"
                  : "bg-background-secondary text-foreground-secondary"
                  }`}
              >
                {day}
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border min-h-[80px]">
              <div className="p-2 border-r border-border bg-background-secondary text-sm text-foreground-secondary flex justify-center pt-3">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {DAYS.map((_, dayIndex) => {
                const daySessions = scheduleByDay[dayIndex]?.filter(
                  (s) => new Date(s.startTime).getHours() === hour
                );
                return (
                  <div key={dayIndex} className="p-1 border-r border-border relative">
                    {daySessions?.map((session) => (
                      <div
                        key={session._id}
                        className="p-2 rounded-none text-xs mb-1 cursor-pointer hover:opacity-80 transition-opacity bg-primary text-on-primary"
                        onClick={() => handleEdit(session)}
                      >
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="flex items-center mt-1 opacity-80">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                        {session.location && (
                          <div className="flex items-center mt-1 opacity-80">
                            <MapPin className="h-3 w-3 mr-1" />
                            {session.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvelle Séance"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitCreate(onCreateSubmit)}
        submitText="Créer"
      >
        <SessionFormFields registerFn={registerCreate} errors={createErrors} />
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title="Modifier Séance"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUpdate(onUpdateSubmit)}
        submitText="Mettre à jour"
      >
        <SessionFormFields registerFn={registerUpdate} errors={updateErrors} />

        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleDelete(editingSession)}
            disabled={isSubmitting}
            className="w-full btn btn-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer cette séance
          </button>
        </div>
      </FormModal>

      <ConfirmModal {...modalProps} />
    </div>
  );
}
