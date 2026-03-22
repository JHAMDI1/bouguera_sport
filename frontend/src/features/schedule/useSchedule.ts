import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToastHelpers } from "@/components/Toast";
import { useConfirmModal } from "@/components/ConfirmModal";
import type { SessionFormData } from "@/schemas";
import { Doc, Id } from "../../../convex/_generated/dataModel";

export function useSchedule() {
    const { success, error } = useToastHelpers();
    const { modalProps, confirm } = useConfirmModal();

    const sessions = useQuery(api.sessions.getSessions, {});
    const groups = useQuery(api.disciplines.getGroups, {});
    const coaches = useQuery(api.users.getUsers, {});

    const createSessionMutation = useMutation(api.sessions.createSession);
    const updateSessionMutation = useMutation(api.sessions.updateSession);
    const deleteSessionMutation = useMutation(api.sessions.deleteSession);

    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const weekStart = useMemo(() => {
        const d = new Date(selectedWeek);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }, [selectedWeek]);

    const scheduleByDay = useMemo(() => {
        const schedule: { [key: number]: any[] } = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        sessions?.forEach((session) => {
            const day = session.dayOfWeek;
            if (schedule[day]) schedule[day].push(session);
        });
        Object.keys(schedule).forEach((day) => {
            schedule[Number(day)].sort((a: any, b: any) => a.startTime - b.startTime);
        });
        return schedule;
    }, [sessions]);

    const createSession = async (data: SessionFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            const baseDate = new Date(weekStart);
            baseDate.setDate(baseDate.getDate() + data.dayOfWeek);
            const startDate = new Date(baseDate);
            startDate.setHours(data.startHour, data.startMinute, 0, 0);
            const endDate = new Date(baseDate);
            endDate.setHours(data.endHour, data.endMinute, 0, 0);

            await createSessionMutation({
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
            onSuccess?.();
            return true;
        } catch (err) {
            error("Erreur", "Impossible de créer la séance");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateSession = async (id: Id<"sessions">, data: SessionFormData, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            const baseDate = new Date(weekStart);
            baseDate.setDate(baseDate.getDate() + data.dayOfWeek);
            const startDate = new Date(baseDate);
            startDate.setHours(data.startHour, data.startMinute, 0, 0);
            const endDate = new Date(baseDate);
            endDate.setHours(data.endHour, data.endMinute, 0, 0);

            await updateSessionMutation({
                id,
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
            onSuccess?.();
            return true;
        } catch (err) {
            error("Erreur", "Impossible de mettre à jour la séance");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteSession = async (session: Doc<"sessions">, onSuccess?: () => void) => {
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
                await deleteSessionMutation({ id: session._id });
                success("Séance supprimée", `${session.title} a été supprimé`);
                onSuccess?.();
                return true;
            } catch (err) {
                error("Erreur", "Impossible de supprimer la séance");
                return false;
            } finally {
                setIsSubmitting(false);
            }
        }
        return false;
    };

    const formatTime = (timestamp: number) =>
        new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    const navigateWeek = (direction: number) => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + direction * 7);
        setSelectedWeek(newDate);
    };

    return {
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
    };
}
