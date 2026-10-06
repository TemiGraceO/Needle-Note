import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Avatar, ScreenHeader } from '../components/ui';
import { Customer, getCustomers } from '../lib/customers';

type Props = { 
  version: number; 
  onOpenCustomer: (id: number) => void; 
  onAddClient: () => void; 
};

export default function CustomersScreen({ version, onOpenCustomer, onAddClient }: Props) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Customer[]>([]);

  useEffect(() => {
    try {
      setItems(getCustomers(search));
    } catch (err) {
      console.error('Failed to query customers ledger:', err);
      setItems([]);
    }
  }, [search, version]);

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Clients Ledger" 
        right={
          <Pressable 
            style={({ pressed }) => [styles.headerAddBtn, pressed && { opacity: 0.7 }]} 
            onPress={onAddClient}
          >
            <MaterialIcons name="add" size={22} color={colors.white} />
          </Pressable>
        }
      />

      <View style={styles.searchWrap}>
        <View style={styles.searchInner}>
          <MaterialIcons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search clients by name or phone..."
            placeholderTextColor={colors.muted}
            style={styles.search}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable 
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} 
            onPress={() => onOpenCustomer(item.id)}
          >
            <Avatar name={item.name} size={42} />
            <View style={styles.meta}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone || 'No phone linked'}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="people-outline" size={32} color={colors.muted} />
            </View>
            <Text style={styles.emptyTextTitle}>
              {search ? 'No clients found' : 'Your measurement book is empty'}
            </Text>
            <Text style={styles.emptyTextSub}>
              {search 
                ? 'Check spelling or try searching with a different name parameter.' 
                : 'Tap the "+" icon at the top right corner to add your first client and record their measurements.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  headerAddBtn: {
    backgroundColor: colors.indigo,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  search: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.ink },
  listContainer: { flexGrow: 1, paddingBottom: 120 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowPressed: { backgroundColor: '#F9F8F3' },
  meta: { marginLeft: 12, flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  phone: { fontSize: 13, color: colors.muted, marginTop: 2, fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTextTitle: { fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  emptyTextSub: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
