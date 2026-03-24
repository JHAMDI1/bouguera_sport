import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function useUserRole() {
    const { userId, isLoaded } = useAuth();

    // Si userId est défini, on fait la requête. Sinon, on skip ("skip" est géré par Convex).
    const user = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : "skip");

    const isLoading = !isLoaded || (userId && user === undefined);

    return {
        role: user?.role || null,
        isLoading,
        isSuperAdmin: user?.role === "superadmin",
        isAdmin: user?.role === "admin" || user?.role === "superadmin",
        isCashier: user?.role === "cashier" || user?.role === "admin" || user?.role === "superadmin",
        isCoach: user?.role === "coach",
        user,
    };
}
