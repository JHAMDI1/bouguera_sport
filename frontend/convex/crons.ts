import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Scheduled cron jobs pour la salle de sport.
 *
 * checkExpiredMedicalCertificates : tous les jours à 8h00 UTC
 * checkLatePayments               : le 1er de chaque mois à 9h00 UTC
 */
const crons = cronJobs();

// Vérification quotidienne des certificats médicaux expirants/expirés
crons.daily(
    "check-expired-medical-certificates",
    { hourUTC: 8, minuteUTC: 0 },
    internal.cron.checkExpiredMedicalCertificates
);

// Vérification des paiements en retard (le 5 de chaque mois)
crons.monthly(
    "check-late-payments",
    { day: 5, hourUTC: 9, minuteUTC: 0 },
    internal.cron.checkLatePayments
);

export default crons;
