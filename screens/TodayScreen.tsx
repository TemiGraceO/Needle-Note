import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Avatar, ScreenHeader } from '../components/ui';
import { getOrdersDueToday, OrderWithCustomer } from '../lib/orders';

type Props = { version: number; onOpenCustomer: (id: number) => void };

export default function TodayScreen({ version, onOpenCustomer }: Props) {
  const [items, setItems] = useState<OrderWithCustomer[]>([]);

  useEffect(() => {
    setItems(getOrdersDueToday());
  }, [version]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Today" />
      <Text style={styles.dateLabel}>{todayLabel}</Text>
      <FlatList
        data={items}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => onOpenCustomer(item.customer_id)}>
            <Avatar name={item.customer_name} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>{item.customer_name}</Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            </View>
            <Text style={styles.status}>{item.status}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No collections due today.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dateLabel: { paddingHorizontal: 16, paddingBottom: 8, color: colors.muted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  desc: { fontSize: 13, color: colors.muted, marginTop: 2 },
  status: { fontSize: 12, color: colors.indigo, fontWeight: '600', textTransform: 'capitalize' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.muted, textAlign: 'center' },
});