import {
    LayoutDashboard,
    Users,
    Wallet,
    DollarSign,
    Calendar,
    Activity,
    UserCircle,
} from "lucide-react";

export const navigationLinks = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Adhérents", href: "/members", icon: Users },
    { name: "Familles", href: "/families", icon: Users },
    { name: "Paiements", href: "/payments", icon: Wallet },
    { name: "Groupes", href: "/groups", icon: Users },
    { name: "Coachs", href: "/coaches", icon: UserCircle },
    { name: "Planning", href: "/schedule", icon: Calendar },
    { name: "Dépenses", href: "/expenses", icon: DollarSign },
    { name: "Disciplines", href: "/disciplines", icon: Activity },
];
