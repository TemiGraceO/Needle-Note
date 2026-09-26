import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getFinancialSummary } from '../lib/db';

interface MoneyScreenProps {
  version: number;
}

interface PaymentHistoryItem {
  id: number;
  amount: number;
  paid_at: string;
  customer_name: string;
}

export default function MoneyScreen({ version }: MoneyScreenProps) {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalBalance: 0,
  });
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);

  useEffect(() => {
    try {
      const data = getFinancialSummary();
      setSummary({
        totalRevenue: data.totalRevenue,
        totalPaid: data.totalPaid,
        totalBalance: data.totalBalance,
      });
      setHistory(data.history);
    } catch (error) {
      console.error('Error loading financial metrics:', error);
    }
  }, [version]);

  // Clean helper to extract the date cleanly from default SQLite strings
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split(' ')[0];
  };

  return (
    <View style={styles.container}>
      {/* --- SCREEN HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financials</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* --- PERFORMANCE OVERVIEW OVERVIEW CARD --- */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Outstanding Balance Collection</Text>
          <Text style={styles.balanceValue}>₦{summary.totalBalance.toLocaleString()}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statGroup}>
              <Text style={styles.statMetaLabel}>Total Booked</Text>
              <Text style={styles.statMetaValue}>₦{summary.totalRevenue.toLocaleString()}</Text>
            </View>
            <View style={styles.statGroup}>
              <Text style={styles.statMetaLabel}>Total Collected</Text>
              <Text style={[styles.statMetaValue, { color: '#10B981' }]}>₦{summary.totalPaid.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* --- DYNAMIC LEDGER LIST ENGINE --- */}
        <Text style={styles.sectionLabel}>Recent Collections Ledger</Text>
        
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconBoundary}>
              <MaterialIcons name="account-balance-wallet" size={28} color={colors.muted} />
            </View>
            <Text style={styles.emptyTextTitle}>No payments logged yet</Text>
            <Text style={styles.emptyTextSub}>
              When customer orders are logged with payments, individual deposit rows will update inside this ledger history feed dynamically.
            </Text>
          </View>
        ) : (
          <View style={styles.ledgerWrapper}>
            {history.map((item, index) => (
              <View 
                key={item.id.toString()} 
                style={[
                  styles.ledgerRow, 
                  index === history.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View>
                  <Text style={styles.ledgerCustomerName}>{item.customer_name}</Text>
                  <Text style={styles.ledgerDate}>📅 {formatDate(item.paid_at)}</Text>
                </View>
                <Text style={styles.ledgerAmount}>+₦{item.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  scrollArea: { padding: 20 },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 24,
  },
  balanceLabel: { fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  balanceValue: { fontSize: 32, fontWeight: '700', color: '#DC2626', marginTop: 4, letterSpacing: -0.5 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statGroup: { flex: 1 },
  statMetaLabel: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  statMetaValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  ledgerWrapper: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  ledgerCustomerName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  ledgerDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  ledgerAmount: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  emptyContainer: { backgroundColor: colors.white, borderRadius: 14, paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  iconBoundary: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTextTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptyTextSub: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
