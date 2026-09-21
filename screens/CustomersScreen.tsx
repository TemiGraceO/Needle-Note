import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { Avatar, PrimaryButton, ScreenHeader } from '../components/ui';
import { Customer, getCustomers } from '../lib/customers';

type Props = { version: number; onOpen: (id: number) => void; onAdd: () => void };

export default function CustomersScreen({ version, onOpen, onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Customer[]>([]);

  useEffect(() => {
    setItems(getCustomers(search));
  }, [search, version]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Customers" />
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or phone"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => onOpen(item.id)}>
            <Avatar name={item.name} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {search ? 'No customer found.' : 'No customers yet. Tap Add customer to start.'}
            </Text>
          </View>
        }
      />
      <View style={{ padding: 16 }}>
        <PrimaryButton label="Add customer" onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  search: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  phone: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.muted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.muted, textAlign: 'center' },
});