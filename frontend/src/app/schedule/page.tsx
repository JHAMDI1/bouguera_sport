"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Calendar, Plus, Edit, X, Check, Clock, MapPin, Users, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastHelpers } from "@/components/Toast";
import { ConfirmModal, useConfirmModal } from "@/components/ConfirmModal";

const sessionSchema = z.object({
  groupId: z.string().min(1, "Groupe requis"),
  coachId: z.string().min(1, "Coach requis"),
  title: z.string().min(1, "Titre requis"),
  dayOfWeek: z.number().min(0).max(6),
  startHour: z.number().min(0).max(23),
  startMinute: z.number().min(0).max(59),
  endHour: z.number().min(0).max(23),
  endMinute: z.number().min(0).max(59),
  location: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8h à 21h

export default function SchedulePage() {
  const { success, error } = useToastHelpers();
  const { modalProps, confirm } = useConfirmModal();

  const sessions = useQuery(api.sessions.getSessions, {});
  const groups = useQuery(api.groups.getGroups);
  const coaches = useQuery(api.users.getUsers);

  const createSession = useMutation(api.sessions.createSession);
  const updateSession = useMutation(api.sessions.updateSession);
  const deleteSession = useMutation(api.sessions.deleteSession);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
    watch: watchCreate,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      dayOfWeek: 1,
      startHour: 18,
      startMinute: 0,
      endHour: 19,
      endMinute: 30,
      isRecurring: true,
    },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
  });

  // Get week start (Monday)
  const weekStart = useMemo(() => {
    const d = new Date(selectedWeek);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [selectedWeek]);

  // Organize sessions by day and time
  const scheduleByDay = useMemo(() => {
    const schedule: { [key: number]: any[] } = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    
    sessions?.forEach((session) => {
      const day = session.dayOfWeek;
      if (schedule[day]) {
        schedule[day].push(session);
      }
    });

    // Sort by start time
    Object.keys(schedule).forEach((day) => {
      schedule[Number(day)].sort((a, b) => a.startTime - b.startTime);
    });

    return schedule;
  }, [sessions]);

  const onCreateSubmit = async (data: SessionFormData) => {
    setIsSubmitting(true);
    try {
      // Calculate timestamps for the selected week
      const baseDate = new Date(weekStart);
      baseDate.setDate(baseDate.getDate() + data.dayOfWeek);
      
      const startDate = new Date(baseDate);
      startDate.setHours(data.startHour, data.startMinute, 0, 0);
      
      const endDate = new Date(baseDate);
      endDate.setHours(data.endHour, data.endMinute, 0, 0);

      await createSession({
        groupId: data.groupId as any,
        coachId: data.coachId as any,
        title: data.title,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        dayOfWeek: data.dayOfWeek,
        location: data.location,
        notes: data.notes,
        isRecurring: data.isRecurring,
      });

      success("Séance créée", `${data.title} ajouté au planning`);
      setIsCreateModalOpen(false);
      resetCreate();
    } catch (err) {
      error("Erreur", "Impossible de créer la séance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateSubmit = async (data: SessionFormData) => {
    if (!editingSession) return;
    
    setIsSubmitting(true);
    try {
      const baseDate = new Date(weekStart);
      baseDate.setDate(baseDate.getDate() + data.dayOfWeek);
      
      const startDate = new Date(baseDate);
      startDate.setHours(data.startHour, data.startMinute, 0, 0);
      
      const endDate = new Date(baseDate);
      endDate.setHours(data.endHour, data.endMinute, 0, 0);

      await updateSession({
        id: editingSession._id,
        groupId: data.groupId as any,
        coachId: data.coachId as any,
        title: data.title,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        dayOfWeek: data.dayOfWeek,
        location: data.location,
        notes: data.notes,
        isRecurring: data.isRecurring,
      });

      success("Séance mise à jour", `${data.title} modifié`);
      setEditingSession(null);
      resetUpdate();
    } catch (err) {
      error("Erreur", "Impossible de mettre à jour la séance");
    } finally {
      setIsSubmitting(false);
    }
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
    const confirmed = await confirm({
      title: "Supprimer la séance",
      message: `Êtes-vous sûr de vouloir supprimer "${session.title}" ?`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
    });

    if (confirmed) {
      setIsSubmitting(true);
      try {
        await deleteSession({ id: session._id });
        success("Séance supprimée", `${session.title} a été supprimé`);
      } catch (err) {
        error("Erreur", "Impossible de supprimer la séance");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedWeek(newDate);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Planning des Cours</h1>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Séance
          </button>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center mt-4 space-x-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-medium">
            Semaine du {weekStart.toLocaleDateString("fr-FR")}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 border-r bg-gray-50 font-medium text-gray-500">Heure</div>
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-center font-medium ${
                index === new Date().getDay() ? "bg-indigo-50 text-indigo-700" : "bg-gray-50 text-gray-700"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time slots */}
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b min-h-[80px]">
            <div className="p-2 border-r bg-gray-50 text-sm text-gray-500">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {DAYS.map((_, dayIndex) => {
              const daySessions = scheduleByDay[dayIndex]?.filter((s) => {
                const startHour = new Date(s.startTime).getHours();
                return startHour === hour;
              });

              return (
                <div key={dayIndex} className="p-1 border-r relative">
                  {daySessions?.map((session) => (
                    <div
                      key={session._id}
                      className="p-2 rounded text-xs mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: session.color || "#4F46E5", color: "white" }}
                      onClick={() => handleEdit(session)}
                    >
                      <div className="font-medium truncate">{session.title}</div>
                      <div className="flex items-center mt-1 text-white/80">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </div>
                      {session.location && (
                        <div className="flex items-center mt-1 text-white/80">
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Séance</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate(onCreateSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    {...registerCreate("title")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    placeholder="Taekwondo - Enfants"
                    disabled={isSubmitting}
                  />
                  {createErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Groupe</label>
                  <select
                    {...registerCreate("groupId")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner un groupe</option>
                    {groups?.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  {createErrors.groupId && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.groupId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Coach</label>
                  <select
                    {...registerCreate("coachId")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner un coach</option>
                    {coaches?.map((coach) => (
                      <option key={coach._id} value={coach._id}>
                        {coach.fullName}
                      </option>
                    ))}
                  </select>
                  {createErrors.coachId && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.coachId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Jour</label>
                  <select
                    {...registerCreate("dayOfWeek", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    disabled={isSubmitting}
                  >
                    {DAYS.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure début</label>
                    <div className="flex space-x-2">
                      <select
                        {...registerCreate("startHour", { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                        disabled={isSubmitting}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        {...registerCreate("startMinute", { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                        disabled={isSubmitting}
                      >
                        <option value={0}>00</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={45}>45</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure fin</label>
                    <div className="flex space-x-2">
                      <select
                        {...registerCreate("endHour", { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                        disabled={isSubmitting}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        {...registerCreate("endMinute", { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                        disabled={isSubmitting}
                      >
                        <option value={0}>00</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={45}>45</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lieu</label>
                  <input
                    {...registerCreate("location")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    placeholder="Salle principale"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    {...registerCreate("notes")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    {...registerCreate("isRecurring")}
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Séance récurrente (hebdomadaire)</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
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

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Modifier Séance</h2>
              <button
                onClick={() => setEditingSession(null)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate(onUpdateSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    {...registerUpdate("title")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    disabled={isSubmitting}
                  />
                  {updateErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{updateErrors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Groupe</label>
                  <select
                    {...registerUpdate("groupId")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner un groupe</option>
                    {groups?.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Coach</label>
                  <select
                    {...registerUpdate("coachId")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionner un coach</option>
                    {coaches?.map((coach) => (
                      <option key={coach._id} value={coach._id}>
                        {coach.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(editingSession)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
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
