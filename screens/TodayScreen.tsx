import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// --- THEME ---
import { colors } from '../theme/colors';

const palette = {
  background: colors.cream,
  surface: colors.white,
  border: colors.line,
  pressed: '#F3EFE8',
  text: colors.ink,
  textMuted: colors.muted,
  textSubtle: '#A29C92',
  accent: colors.indigo,
  accentSoft: '#F4E9E3',
  sage: '#4E7A6F',
  sageSoft: '#E7EFEC',
  gold: '#B08A3E',
  danger: '#D9534F',
  white: colors.white,
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
    name.trim().split(/\s+/).slice(0, 2).map((part) => part?.toUpperCase() ?? '').join('') || '?'
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
  
  const paddingTop = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 12 : 54;
  const paddingBottom = Platform.OS === 'ios' ? 134 : 110;

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
      <View style={[styles.content, { paddingTop, paddingBottom }]}>
        
        {/* --- HEADER BLOCK --- */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
          
          <Pressable onPress={onOpenNotifications} hitSlop={8} style={({ pressed }) => [styles.iconButton, styles.pop, pressed && styles.pressed]}>
            <MaterialIcons name="notifications-none" size={22} color={palette.text} />
            {notificationCount > 0 && <View style={styles.badge} />}
          </Pressable>
        </View>

        {/* --- MINIMALIST, TRANSPARENT WORKSHOP METRICS ROW --- */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryNumber}>0</Text> fittings
            </Text>
          </View>
          
          <View style={styles.summaryVerticalDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryNumber}>0</Text> to cut
            </Text>
          </View>
          
          <View style={styles.summaryVerticalDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryNumber}>0</Text> pickups
            </Text>
          </View>
        </View>

        {/* --- QUICK ACTION CENTER --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Quick actions</Text>
          <View style={styles.actions}>
            <QuickAction icon="add" label="New order" onPress={onAddOrder} primary />
            <QuickAction icon="person-add-alt" label="Add client" onPress={onAddClient} />
            <QuickAction icon="event" label="Schedule" onPress={onOpenSchedule} />
            <QuickAction icon="inventory-2" label="Inventory" onPress={onOpenInventory} />
          </View>
        </View>

        {/* --- AGENDA SCHEDULE QUEUE --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's schedule</Text>
          </View>

          {agenda.length === 0 ? (
            <EmptyState onAddOrder={onAddOrder} onViewClients={onViewClients} />
          ) : (
            <View style={[styles.card, styles.cardClip, styles.popStrong]}>
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
      </View>
    </View>
  );
}

function QuickAction({ icon, label, onPress, primary = false }: { icon: IconName; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
      <View style={[styles.actionIcon, styles.pop, primary && styles.actionIconPrimary]}>
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
        <View style={[styles.avatar, styles.popLight]}><Text style={styles.avatarText}>{getInitials(item.customerName)}</Text></View>
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
    <View style={[styles.card, styles.empty, styles.popStrong]}>
      <View style={[styles.emptyIcon, styles.popLight]}><MaterialIcons name="event-available" size={28} color={palette.sage} /></View>
      <Text style={styles.emptyTitle}>You're all caught up</Text>
      <Text style={styles.emptyText}>No fittings, pickups or collections today. New appointments will show up here.</Text>
      <Pressable onPress={onAddOrder} style={({ pressed }) => [styles.primaryButton, styles.pop, pressed && styles.pressed]}>
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
  content: { flex: 1, paddingHorizontal: 20 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  actionPressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },

  popLight: {
    ...Platform.select({
      ios: { shadowColor: '#1C1B19', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  pop: {
    ...Platform.select({
      ios: { shadowColor: '#1C1B19', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  popStrong: {
    ...Platform.select({
      ios: { shadowColor: '#1C1B19', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 5 },
    }),
  },

  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  headerText: { flex: 1, paddingRight: 16 },
  date: { fontSize: 13, fontWeight: '500', color: palette.textMuted },
  greeting: { fontSize: 28, fontWeight: '700', color: palette.text, letterSpacing: -0.5, marginTop: 4 },
  
  // REFINED TRANSPARENT METRICS BAR STYLING
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Fixed: Completely transparent
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.textMuted,
  },
  summaryNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.indigo, // Gives a clean contrast color highlight to the numeric status value
  },
  summaryVerticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.line,
  },

  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
badge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.danger },
section: { marginTop: 20 },
sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.text, letterSpacing: -0.2 },
sectionTitleSpacing: { marginBottom: 12 },
actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
action: { flex: 1, alignItems: 'center' },
actionIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
actionIconPrimary: { backgroundColor: palette.accent, borderColor: palette.accent },
actionLabel: { fontSize: 12, fontWeight: '500', color: palette.text },
card: { backgroundColor: palette.surface, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border, padding: 16 },
cardClip: { padding: 0, overflow: 'hidden' },
row: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: palette.surface },
rowPressed: { backgroundColor: palette.pressed },
avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
avatarText: { fontSize: 14, fontWeight: '600', color: palette.text },
rowBody: { flex: 1, marginRight: 8 },
rowTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
rowMetaWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
dot: { width: 6, height: 6, borderRadius: 3 },
rowMeta: { fontSize: 12, color: palette.textMuted },
rowTime: { fontSize: 12, color: palette.textSubtle, marginRight: 4, fontWeight: '500' },
rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.border, marginLeft: 66 },
empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
emptyIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
emptyTitle: { fontSize: 16, fontWeight: '600', color: palette.text, marginBottom: 6 },
emptyText: { fontSize: 13, color: palette.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
primaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, gap: 6 },
primaryButtonText: { color: palette.white, fontSize: 14, fontWeight: '600' },
secondaryButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
secondaryButtonText: { color: palette.accent, fontSize: 13, fontWeight: '600' },
});