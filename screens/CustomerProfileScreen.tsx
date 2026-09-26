import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Avatar, PrimaryButton, ScreenHeader } from '../components/ui';
import { Customer, getCustomer, saveMeasurements } from '../lib/customers';

const FIELDS = ['Neck', 'Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve'];

function waNumber(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('234')) return d;
  if (d.startsWith('0')) return '234' + d.slice(1);
  return d;
}

type Props = { id: number; onBack: () => void; onChanged: () => void };

export default function CustomerProfileScreen({ id, onBack, onChanged }: Props) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  // Track layout edit state toggle modes
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const c = getCustomer(id);
    setCustomer(c);
    
    const measurements = c?.measurements ?? {};
    setValues(measurements);
    
    // If measurements are brand new (all empty), open in Edit Mode automatically
    const hasData = Object.values(measurements).some(v => v && v !== '0');
    setIsEditing(!hasData);
  }, [id]);

  if (!customer) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <ScreenHeader title="Customer Profile" onBack={onBack} />
      </View>
    );
  }

  const save = () => {
    saveMeasurements(id, values);
    onChanged();
    setIsEditing(false); // Lock fields instantly upon clicking save
    Alert.alert('Saved', 'Measurements saved successfully.');
  };

  const call = () => {
    if (customer.phone) Linking.openURL(`tel:${customer.phone}`);
  };

  const message = () => {
    if (customer.phone) Linking.openURL(`https://wa.me/${waNumber(customer.phone)}`);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Customer Profile" onBack={onBack} />
      
      <ScrollView contentContainerStyle={styles.scrollArea} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* --- CUSTOMER INFO TOP BANNER --- */}
        <View style={styles.topCard}>
          <Avatar name={customer.name} size={60} />
          <View style={styles.topMeta}>
            <Text style={styles.name}>{customer.name}</Text>
            <Text style={styles.phone}>{customer.phone || 'No phone number linked'}</Text>
          </View>
        </View>

        {/* --- DYNAMIC ACTION PLATFORMS WITH ICONS --- */}
        {customer.phone ? (
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={call}>
              <MaterialIcons name="call" size={18} color={colors.indigo} />
              <Text style={styles.actionText}>Call Client</Text>
            </Pressable>
            
            <Pressable style={styles.actionButton} onPress={message}>
              <MaterialIcons name="chat" size={18} color="#10B981" />
              <Text style={[styles.actionText, { color: '#10B981' }]}>WhatsApp</Text>
            </Pressable>
          </View>
        ) : null}

        {/* --- MEASUREMENT SUBSECTION BANNER --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Measurements (Inches)</Text>
          {!isEditing && (
            <Pressable style={styles.inlineEditButton} onPress={() => setIsEditing(true)}>
              <MaterialIcons name="edit" size={14} color={colors.indigo} />
              <Text style={styles.inlineEditButtonText}>Edit</Text>
            </Pressable>
          )}
        </View>

        {/* --- METRICS LEDGER PRESENTATION GRID --- */}
        <View style={styles.grid}>
          {FIELDS.map((f) => (
            <View key={f} style={[styles.cell, !isEditing && styles.cellReadOnly]}>
              <TextInput
                value={values[f] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [f]: t }))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.muted}
                editable={isEditing}
                style={[styles.cellInput, !isEditing && styles.cellInputReadOnly]}
              />
              <Text style={styles.cellLabel}>{f}</Text>
            </View>
          ))}
        </View>

        {/* --- CONDITIONAL ACTION STATES FOOTER BUTTON --- */}
        {isEditing && (
          <View style={styles.saveActionArea}>
            <PrimaryButton label="Save Sizing Chart" onPress={save} />
          </View>
        )}

        {/* --- PAST PRODUCTION RECORDS FEED --- */}
        <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 12 }]}>Past Orders History</Text>
        <View style={styles.emptyHistoryBox}>
          <MaterialIcons name="history" size={24} color={colors.muted} />
          <Text style={styles.emptyHistoryText}>No previous order folders exist for this profile.</Text>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.cream 
  },
  scrollArea: { 
    padding: 20 
  },
  topCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16 
  },
  topMeta: { 
    marginLeft: 16,
    flex: 1 
  },
  name: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827',
    letterSpacing: -0.4
  },
  phone: { 
    fontSize: 14, 
    color: colors.muted, 
    marginTop: 2,
    fontWeight: '500'
  },
  actions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 24 
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: { 
    color: colors.indigo, 
    fontWeight: '600',
    fontSize: 14
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#111827', 
    textTransform: 'uppercase', 
    letterSpacing: 0.8 
  },
  inlineEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inlineEditButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.indigo,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 6 
  },
  cell: {
    width: '31.3%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  cellReadOnly: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  cellInput: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: colors.indigo, 
    padding: 0 
  },
  cellInputReadOnly: {
    color: '#374151',
  },
  cellLabel: { 
    fontSize: 12, 
    color: colors.muted, 
    marginTop: 4,
    fontWeight: '500' 
  },
  saveActionArea: {
    marginTop: 16,
  },
  emptyHistoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 12,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: colors.muted,
    flex: 1,
  }
});
