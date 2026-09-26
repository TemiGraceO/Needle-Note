import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const palette = {
  background: '#F7F5F0',
  surface: '#FFFFFF',
  border: '#ECE7DE',
  pressed: '#F3EFE8',
  text: '#1C1B19',
  textMuted: '#6F6A62',
  textSubtle: '#A29C92',
  accent: '#69a8d5',
  accentSoft: '#F4E9E3',
  sage: '#4E7A6F',
  sageSoft: '#E7EFEC',
  gold: '#B08A3E',
  danger: '#D9534F',
  white: '#FFFFFF',
};

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface TodayItem {
  id: number;
  customerName: string;
  detail?: string;
  time?: string;
}

interface TodayScreenProps {
  version?: number;
  items?: TodayItem[];
  onOpenCustomer: (id: number) => void;
  onAddOrder?: () => void;
  onAddClient?: () => void;
  onOpenSchedule?: () => void;
  onOpenInventory?: () => void;
  onViewClients?: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
}

const MAX_AGENDA_ITEMS = 5;
const noop = () => {};

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string) {
  return (
    name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '?'
  );
}

export default function TodayScreen({
  items = [],
  onOpenCustomer,
  onAddOrder = noop,
  onAddClient = noop,
  onOpenSchedule = noop,
  onOpenInventory = noop,
  onViewClients = noop,
  onOpenNotifications = noop,
  notificationCount = 0,
}: TodayScreenProps) {
  const insets = useSafeAreaInsets();

  const { greeting, dateLabel } = useMemo(() => {
    const now = new Date();
    return {
      greeting: getGreeting(now),
      dateLabel: now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, []);

  const agenda = items.slice(0, MAX_AGENDA_ITEMS);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
          <Pressable onPress={onOpenNotifications} hitSlop={8} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <MaterialIcons name="notifications-none" size={22} color={palette.text} />
            {notificationCount > 0 && <View style={styles.badge} />}
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Quick actions</Text>
          <View style={styles.actions}>
            <QuickAction icon="add" label="New order" onPress={onAddOrder} primary />
            <QuickAction icon="person-add-alt" label="Add client" onPress={onAddClient} />
            <QuickAction icon="event" label="Schedule" onPress={onOpenSchedule} />
            <QuickAction icon="inventory-2" label="Inventory" onPress={onOpenInventory} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's schedule</Text>
          </View>

          {agenda.length === 0 ? (
            <EmptyState onAddOrder={onAddOrder} onViewClients={onViewClients} />
          ) : (
            <View style={[styles.card, styles.cardClip]}>
              {agenda.map((item, index) => (
                <AgendaRow
                  key={item.id}
                  item={item}
                  isLast={index === agenda.length - 1}
                  onPress={() => onOpenCustomer(item.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, onPress, primary = false }: { icon: IconName; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <View style={[styles.actionIcon, primary && styles.actionIconPrimary]}>
        <MaterialIcons name={icon} size={22} color={primary ? palette.white : palette.accent} />
      </View>
      <Text style={styles.actionLabel} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function AgendaRow({ item, isLast, onPress }: { item: TodayItem; isLast: boolean; onPress: () => void }) {
  return (
    <>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(item.customerName)}</Text></View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.customerName}</Text>
          {item.detail ? (
            <View style={styles.rowMetaWrap}>
              <View style={[styles.dot, { backgroundColor: palette.gold }]} />
              <Text style={styles.rowMeta} numberOfLines={1}>{item.detail}</Text>
            </View>
          ) : null}
        </View>
        {item.time ? <Text style={styles.rowTime}>{item.time}</Text> : null}
        <MaterialIcons name="chevron-right" size={20} color={palette.textSubtle} />
      </Pressable>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

function EmptyState({ onAddOrder, onViewClients }: { onAddOrder: () => void; onViewClients: () => void }) {
  return (
    <View style={[styles.card, styles.empty]}>
      <View style={styles.emptyIcon}><MaterialIcons name="event-available" size={28} color={palette.sage} /></View>
      <Text style={styles.emptyTitle}>You're all caught up</Text>
      <Text style={styles.emptyText}>No fittings, pickups or collections today. New appointments will show up here.</Text>
      <Pressable onPress={onAddOrder} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <MaterialIcons name="add" size={20} color={palette.white} />
        <Text style={styles.primaryButtonText}>New order</Text>
      </Pressable>
      <Pressable onPress={onViewClients} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
        <Text style={styles.secondaryButtonText}>View clients</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 20 },
  pressed: { opacity: 0.7 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  headerText: { flex: 1, paddingRight: 16 },
  date: { fontSize: 13, fontWeight: '500', color: palette.textMuted },
  greeting: { fontSize: 28, fontWeight: '700', color: palette.text, letterSpacing: -0.5, marginTop: 4 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 4.5, backgroundColor: palette.danger, borderWidth: 1.5, borderColor: palette.surface },
  card: { backgroundColor: palette.surface, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border },
  cardClip: { borderRadius: 16, overflow: 'hidden' },
  section: { marginTop: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: palette.text },
  sectionTitleSpacing: { marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, alignItems: 'center' },
  actionIcon: { alignSelf: 'stretch', height: 56, borderRadius: 14, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  actionIconPrimary: { backgroundColor: palette.accent, borderColor: palette.accent },
  actionLabel: { fontSize: 12, fontWeight: '500', color: palette.text, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowPressed: { backgroundColor: palette.pressed },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '600', color: palette.accent },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
  rowMetaWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  rowMeta: { flexShrink: 1, fontSize: 13, color: palette.textMuted },
  rowTime: { fontSize: 13, fontWeight: '500', color: palette.textMuted },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.border, marginLeft: 68 },
  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: palette.sageSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: palette.text },
  emptyText: { fontSize: 14, lineHeight: 20, color: palette.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 20, maxWidth: 280 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'stretch', backgroundColor: palette.accent, paddingVertical: 13, borderRadius: 12 },
  primaryButtonText: { fontSize: 15, fontWeight: '600', color: palette.white },
  secondaryButton: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600', color: palette.accent },
});