/**
 * PDF Receipt Template - E4-S8
 *
 * Professional payment receipt using @react-pdf/renderer
 * Brand colors, itemized details, optimized for < 500KB file size
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register fonts for professional appearance
// Using system fonts to avoid additional file size
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

// Brand colors from Pickleball Passport
const colors = {
  primary: '#10b981', // Emerald green
  secondary: '#059669',
  text: '#111827',
  textLight: '#6b7280',
  border: '#e5e7eb',
  background: '#f9fafb',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
  },
  header: {
    marginBottom: 30,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 10,
    color: colors.textLight,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.secondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: colors.textLight,
  },
  value: {
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 8,
    marginBottom: 8,
    fontWeight: 'bold',
    backgroundColor: colors.background,
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: `1px dotted ${colors.border}`,
  },
  tableCol1: {
    width: '50%',
  },
  tableCol2: {
    width: '20%',
    textAlign: 'center',
  },
  tableCol3: {
    width: '30%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTop: `2px solid ${colors.primary}`,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 15,
    fontSize: 8,
    color: colors.textLight,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentBadge: {
    backgroundColor: colors.primary,
    color: 'white',
    padding: 8,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export interface ReceiptData {
  // Receipt metadata
  receiptNumber: string;
  receiptDate: string;

  // Payment details
  paymentId: string;
  stripePaymentIntentId: string;
  amount: number; // in cents
  currency: string;
  paymentMethod: string; // e.g., "Visa ending in 4242"

  // Booking details
  bookingReference: string;
  bookingDate: string;

  // Trip details
  tripName: string;
  tripDates: string;
  tripLocation: string;
  guestCount: number;

  // Guest details
  guestName: string;
  guestEmail: string;

  // Company details
  companyName: string;
  companyEmail: string;
  companyWebsite: string;
}

export const PaymentReceipt: React.FC<{ data: ReceiptData }> = ({ data }) => {
  const formatCurrency = (amountInCents: number, currency: string = 'USD') => {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>{data.companyName}</Text>
          <Text style={styles.tagline}>
            Your Pickleball Adventure Awaits
          </Text>
        </View>

        {/* Receipt Title */}
        <Text style={styles.receiptTitle}>Payment Receipt</Text>

        {/* Receipt Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt Number:</Text>
            <Text style={styles.value}>{data.receiptNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt Date:</Text>
            <Text style={styles.value}>{data.receiptDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment ID:</Text>
            <Text style={styles.value}>{data.paymentId}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{data.guestName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.guestEmail}</Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Booking Reference:</Text>
            <Text style={styles.value}>{data.bookingReference}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Booking Date:</Text>
            <Text style={styles.value}>{data.bookingDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trip Name:</Text>
            <Text style={styles.value}>{data.tripName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trip Dates:</Text>
            <Text style={styles.value}>{data.tripDates}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{data.tripLocation}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Number of Guests:</Text>
            <Text style={styles.value}>{data.guestCount}</Text>
          </View>
        </View>

        {/* Itemized Charges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itemized Charges</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Description</Text>
              <Text style={styles.tableCol2}>Quantity</Text>
              <Text style={styles.tableCol3}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>{data.tripName}</Text>
              <Text style={styles.tableCol2}>{data.guestCount}</Text>
              <Text style={styles.tableCol3}>
                {formatCurrency(data.amount, data.currency)}
              </Text>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(data.amount, data.currency)}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{data.paymentMethod}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID:</Text>
            <Text style={styles.value}>{data.stripePaymentIntentId}</Text>
          </View>
          <View style={styles.paymentBadge}>
            <Text>✓ PAID IN FULL</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text>{data.companyName}</Text>
            <Text>{data.companyEmail}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text>{data.companyWebsite}</Text>
            <Text>Generated on {new Date().toLocaleDateString()}</Text>
          </View>
          <Text style={{ marginTop: 8, textAlign: 'center' }}>
            Thank you for choosing {data.companyName}! We look forward to your adventure.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
