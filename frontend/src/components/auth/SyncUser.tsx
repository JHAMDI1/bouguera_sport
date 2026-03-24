"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function SyncUser() {
    const { isSignedIn, isLoaded } = useUser();
    const syncUser = useMutation(api.users.syncUser);
    const [hasSynced, setHasSynced] = useState(false);

    useEffect(() => {
        if (isLoaded && isSignedIn && !hasSynced) {
            syncUser()
                .then(() => setHasSynced(true))
                .catch((err) => console.error("Erreur lors de la synchronisation de l'utilisateur:", err));
        }
    }, [isLoaded, isSignedIn, hasSynced, syncUser]);

    return null;
}
