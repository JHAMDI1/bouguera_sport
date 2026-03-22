"use client";

import { useState } from "react";
import { Printer, Download, X, Receipt } from "lucide-react";

interface ReceiptData {
  receiptNumber: string;
  memberName: string;
  amount: number;
  month: string;
  year: number;
  paymentDate: string;
  receivedBy: string;
  discipline?: string;
}

interface ReceiptPDFProps {
  data: ReceiptData;
  onClose: () => void;
}

export function ReceiptPDF({ data, onClose }: ReceiptPDFProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownload = () => {
    // Créer un Blob avec le contenu du reçu en texte
    const receiptContent = `
REÇU DE PAIEMENT
================

N° Reçu: ${data.receiptNumber}
Date: ${data.paymentDate}

ADHÉRENT
--------
Nom: ${data.memberName}
${data.discipline ? `Discipline: ${data.discipline}` : ""}

DÉTAILS DU PAIEMENT
-------------------
Mois: ${data.month} ${data.year}
Montant: ${data.amount.toLocaleString("fr-FR")} TND
Méthode: Espèces

REÇU PAR
--------
${data.receivedBy}

Merci pour votre paiement!
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Recu_${data.receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-none-none w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center">
            <Receipt className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Reçu {data.receiptNumber}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-none"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-none"
              title="Imprimer"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-200 rounded-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content - Print Area */}
        <div id="receipt-print-area" className="p-8 bg-white">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">CLUB SPORTIF</h1>
            <p className="text-sm text-gray-600">Reçu de Paiement</p>
            <div className="mt-2 inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-none">
              N° {data.receiptNumber}
            </div>
          </div>

          {/* Date */}
          <div className="text-right text-sm text-gray-600 mb-4">
            Date: {data.paymentDate}
          </div>

          {/* Member Info */}
          <div className="border-t border-b border-2 border-foreground py-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Adhérent</h3>
            <p className="text-gray-800">
              <span className="font-medium">Nom:</span> {data.memberName}
            </p>
            {data.discipline && (
              <p className="text-gray-800">
                <span className="font-medium">Discipline:</span> {data.discipline}
              </p>
            )}
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Détails du Paiement</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-2 border-foreground">
                  <td className="py-2 text-gray-600">Période</td>
                  <td className="py-2 text-right font-medium">{data.month} {data.year}</td>
                </tr>
                <tr className="border-b border-2 border-foreground">
                  <td className="py-2 text-gray-600">Méthode de paiement</td>
                  <td className="py-2 text-right font-medium">Espèces</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 text-gray-900 font-semibold">Montant Total</td>
                  <td className="py-3 text-right font-bold text-lg text-primary">
                    {data.amount.toLocaleString("fr-FR")} TND
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Received By */}
          <div className="text-sm text-gray-600 mb-6">
            <span className="font-medium">Reçu par:</span> {data.receivedBy}
          </div>

          {/* Signature Area */}
          <div className="mt-8 pt-4 border-t border-2 border-foreground">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-700 mb-1">Signature du Caissier</p>
                <div className="w-32 h-16 border-b border-gray-400"></div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-700">Cachet du Club</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-700">
            <p>Merci pour votre paiement!</p>
            <p className="mt-1">Ce reçu est une preuve de paiement. Veuillez le conserver.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

// Hook to generate receipt data from payment
export function useReceiptGenerator() {
  const generateReceiptData = (
    payment: any,
    member: any,
    user: any,
    discipline?: any
  ): ReceiptData => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    return {
      receiptNumber: payment.receiptNumber,
      memberName: `${member?.firstName || ""} ${member?.lastName || ""}`.trim(),
      amount: payment.amount,
      month: months[payment.monthCovered - 1] || `Mois ${payment.monthCovered}`,
      year: payment.yearCovered,
      paymentDate: new Date(payment.paymentDate).toLocaleDateString("fr-FR"),
      receivedBy: user?.fullName || "Caissier",
      discipline: discipline?.name,
    };
  };

  return { generateReceiptData };
}
