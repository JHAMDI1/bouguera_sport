import { Id } from "../../convex/_generated/dataModel";

export const getDisciplineName = (disciplines: any[] | undefined, id: string | Id<"disciplines">) =>
    disciplines?.find((d) => d._id === id)?.name || "Inconnu";

export const getGroupName = (groups: any[] | undefined, id: string | Id<"groups">) =>
    groups?.find((g) => g._id === id)?.name || "Inconnu";

export const getFamilyName = (families: any[] | undefined, id: string | Id<"families">) =>
    families?.find((f) => f._id === id)?.familyName || "Inconnu";

export const getCoachName = (coaches: any[] | undefined, id: string | Id<"users">) =>
    coaches?.find((c) => c._id === id)?.fullName || "Inconnu";

export const getUserName = (users: any[] | undefined, id: string | Id<"users">) =>
    users?.find((u) => u._id === id)?.fullName || "Inconnu";

export const getCategoryName = (categories: any[] | undefined, id: string | Id<"expenseCategories">) =>
    categories?.find((c) => c._id === id)?.name || "Inconnu";

export const getMemberName = (members: any[] | undefined, id: string | Id<"members">) => {
    const member = members?.find((m) => m._id === id);
    return member ? `${member.firstName} ${member.lastName}` : "Inconnu";
};
