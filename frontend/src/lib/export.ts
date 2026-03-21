// Utilitaire d'export CSV pour les rapports

export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  headers?: { key: string; label: string }[]
) {
  if (data.length === 0) {
    alert("Aucune donnée à exporter");
    return;
  }

  // Déterminer les colonnes
  const columns = headers || Object.keys(data[0]).map((key) => ({ key, label: key }));

  // Créer l'en-tête CSV
  const headerRow = columns.map((col) => `"${col.label}"`).join(";");

  // Créer les lignes de données
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = item[col.key];
        // Formater les valeurs
        if (value === null || value === undefined) return '""';
        if (typeof value === "boolean") return `"${value ? "Oui" : "Non"}"`;
        if (typeof value === "number") return `"${value}"`;
        if (value instanceof Date) return `"${value.toLocaleDateString("fr-FR")}"`;
        // Échapper les guillemets dans les chaînes
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(";");
  });

  // Combiner en-tête et données
  const csvContent = [headerRow, ...rows].join("\n");

  // Créer le Blob et télécharger
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Fonctions spécifiques pour chaque type de rapport

export function exportMembersToCSV(members: any[]) {
  const data = members.map((m) => ({
    Nom: `${m.firstName} ${m.lastName}`,
    Téléphone: m.phone || "-",
    Email: m.email || "-",
    "Date d'inscription": new Date(m.registrationDate).toLocaleDateString("fr-FR"),
    "Certificat médical": m.medicalCertificateExpiry
      ? new Date(m.medicalCertificateExpiry).toLocaleDateString("fr-FR")
      : "-",
    Statut: m.isActive ? "Actif" : "Inactif",
  }));

  exportToCSV(data, "adherents");
}

export function exportPaymentsToCSV(payments: any[]) {
  const data = payments.map((p) => ({
    "N° Reçu": p.receiptNumber,
    Membre: p.memberName || "-",
    Montant: p.amount,
    "Mois couvert": `${p.monthCovered}/${p.yearCovered}`,
    "Date de paiement": new Date(p.paymentDate).toLocaleDateString("fr-FR"),
    "Reçu par": p.receivedByName || "-",
  }));

  exportToCSV(data, "paiements");
}

export function exportExpensesToCSV(expenses: any[]) {
  const data = expenses.map((e) => ({
    Date: new Date(e.expenseDate).toLocaleDateString("fr-FR"),
    Catégorie: e.categoryName || "-",
    Description: e.description,
    Montant: e.amount,
    "Enregistré par": e.recordedByName || "-",
  }));

  exportToCSV(data, "depenses");
}

export function exportFamiliesToCSV(families: any[]) {
  const data = families.map((f) => ({
    "Nom de famille": f.familyName,
    "Contact principal": f.primaryContactName,
    Téléphone: f.primaryContactPhone || "-",
    Réduction: f.discountPercentage ? `${f.discountPercentage}%` : "-",
    Statut: f.isActive ? "Actif" : "Inactif",
    "Nombre de membres": f.members?.length || 0,
  }));

  exportToCSV(data, "familles");
}
