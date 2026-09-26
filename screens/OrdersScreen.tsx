import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getOrdersWithCustomerNames } from '../lib/db';

interface OrdersScreenProps {
  version: number;
  onAddOrder: () => void;
}

export default function OrdersScreen({ version, onAddOrder }: OrdersScreenProps) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchedOrders = getOrdersWithCustomerNames();
    setOrders(fetchedOrders);
  }, [version]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders Feed</Text>
        <Pressable style={styles.addButton} onPress={onAddOrder}>
          <MaterialIcons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconBoundary}>
            <MaterialIcons name="assignment" size={32} color={colors.muted} />
          </View>
          <Text style={styles.emptyTextTitle}>No active client orders</Text>
          <Text style={styles.emptyTextSub}>Tap the button above to log a style and take material photos.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              {item.style_photo ? (
                <Image source={{ uri: item.style_photo }} style={styles.materialPreview} />
              ) : (
                <View style={[styles.materialPreview, styles.centerFallback]}>
                  <MaterialIcons name="texture" size={24} color={colors.muted} />
                </View>
              )}
              <View style={styles.cardDetails}>
                <Text style={styles.customerName}>{item.customer_name}</Text>
                <Text style={styles.styleDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.dateBadge}>📅 {item.due_date || 'No Date'}</Text>
                  <Text style={styles.balanceBadge}>₦{item.total?.toLocaleString() || 0} Total</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.indigo, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
  addButtonText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconBoundary: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTextTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptyTextSub: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 },
  orderCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 12, marginBottom: 12 },
  materialPreview: { width: 70, height: 70, borderRadius: 8, backgroundColor: colors.cream },
  centerFallback: { alignItems: 'center', justifyContent: 'center' },
  cardDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  customerName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  styleDesc: { fontSize: 13, color: colors.muted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  dateBadge: { fontSize: 11, color: '#374151', fontWeight: '500' },
  balanceBadge: { fontSize: 11, color: colors.indigo, fontWeight: '600' },
});
