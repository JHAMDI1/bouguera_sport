import {
    LayoutDashboard,
    Users,
    Wallet,
    DollarSign,
    Calendar,
    Activity,
    UserCircle,
    Settings,
} from "lucide-react";

export type Role = "superadmin" | "admin" | "cashier" | "coach";

export interface NavigationLink {
    name: string;
    href: string;
    icon: any;
    roles: Role[]; // Rôles autorisés à voir ce lien
}

export const navigationLinks: NavigationLink[] = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, roles: ["superadmin", "admin"] },
    { name: "Adhérents", href: "/members", icon: Users, roles: ["superadmin", "admin", "cashier", "coach"] },
    { name: "Familles", href: "/families", icon: Users, roles: ["superadmin", "admin", "cashier"] },
    { name: "Paiements", href: "/payments", icon: Wallet, roles: ["superadmin", "admin", "cashier"] },
    { name: "Groupes", href: "/groups", icon: Users, roles: ["superadmin", "admin", "coach"] },
    { name: "Staff & Coachs", href: "/coaches", icon: UserCircle, roles: ["superadmin", "admin"] },
    { name: "Planning", href: "/schedule", icon: Calendar, roles: ["superadmin", "admin", "coach"] },
    { name: "Dépenses", href: "/expenses", icon: DollarSign, roles: ["superadmin", "admin", "cashier"] },
    { name: "Disciplines", href: "/disciplines", icon: Activity, roles: ["superadmin", "admin"] },
    { name: "Paramètres", href: "/settings", icon: Settings, roles: ["superadmin"] },
];
