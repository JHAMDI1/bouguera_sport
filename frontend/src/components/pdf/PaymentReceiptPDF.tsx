import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottomWidth: 1, borderBottomColor: '#6366F1', paddingBottom: 20 },
    clubName: { fontSize: 24, fontWeight: 'bold', color: '#6366F1' },
    receiptTitle: { fontSize: 20, color: '#333333' },
    infoSection: { marginBottom: 30 },
    row: { flexDirection: 'row', marginBottom: 8 },
    label: { width: 150, color: '#666666', fontSize: 12 },
    value: { fontSize: 12, color: '#111111', fontWeight: 'bold' },
    amountBox: { marginTop: 20, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center' },
    amountText: { fontSize: 24, fontWeight: 'bold', color: '#111111' },
    footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 10 }
});

export interface ReceiptData {
    receiptNumber: string;
    memberName: string;
    amount: number;
    month: string;
    year: number;
    paymentDate: string;
    receivedBy: string;
    discipline?: string;
}

interface PaymentReceiptProps {
    data: ReceiptData;
    clubSettings?: any;
}

export const PaymentReceiptPDF = ({ data, clubSettings }: PaymentReceiptProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.clubName}>{clubSettings?.clubName || "Sahbi Gym"}</Text>
                        {clubSettings?.address && <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>{clubSettings.address}</Text>}
                        {clubSettings?.contactPhone && <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{clubSettings.contactPhone}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.receiptTitle}>REÇU DE PAIEMENT</Text>
                        <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>N° {data.receiptNumber}</Text>
                        <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Date: {data.paymentDate}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>Détails de l'Adhérent</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nom complet :</Text>
                        <Text style={styles.value}>{data.memberName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Période couverte :</Text>
                        <Text style={styles.value}>{data.month} {data.year}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Moyen de paiement :</Text>
                        <Text style={styles.value}>Espèces</Text>
                    </View>
                    {data.discipline && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Discipline :</Text>
                            <Text style={styles.value}>{data.discipline}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.amountBox}>
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Montant Total Payé</Text>
                    <Text style={styles.amountText}>{data.amount.toLocaleString('fr-FR')} {clubSettings?.currency || "TND"}</Text>
                </View>

                <View style={styles.footer}>
                    <Text>Ce reçu a été généré électroniquement et sert de preuve de paiement.</Text>
                    <Text style={{ marginTop: 2 }}>Merci de votre confiance ! - {clubSettings?.clubName || "Sahbi Gym"}</Text>
                </View>
            </Page>
        </Document>
    );
};
