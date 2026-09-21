import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

  useEffect(() => {
    const c = getCustomer(id);
    setCustomer(c);
    setValues(c?.measurements ?? {});
  }, [id]);

  if (!customer) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenHeader title="Customer" onBack={onBack} />
      </View>
    );
  }

  const save = () => {
    saveMeasurements(id, values);
    onChanged();
    Alert.alert('Saved', 'Measurements saved on this phone.');
  };

  const call = () => {
    if (customer.phone) Linking.openURL(`tel:${customer.phone}`);
  };

  const message = () => {
    if (customer.phone) Linking.openURL(`https://wa.me/${waNumber(customer.phone)}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Customer" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <Avatar name={customer.name} size={56} />
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.name}>{customer.name}</Text>
            <Text style={styles.phone}>{customer.phone || 'No phone number'}</Text>
          </View>
        </View>

        {customer.phone ? (
          <View style={styles.actions}>
            <Pressable style={styles.action} onPress={call}>
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={message}>
              <Text style={styles.actionText}>WhatsApp</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.section}>Measurements in inches</Text>
        <View style={styles.grid}>
          {FIELDS.map((f) => (
            <View key={f} style={styles.cell}>
              <TextInput
                value={values[f] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [f]: t }))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.muted}
                style={styles.cellInput}
              />
              <Text style={styles.cellLabel}>{f}</Text>
            </View>
          ))}
        </View>
        <PrimaryButton label="Save measurements" onPress={save} />

        <Text style={[styles.section, { marginTop: 24 }]}>Past orders</Text>
        <Text style={{ color: colors.muted }}>Orders will appear here once we build them.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 18, fontWeight: '600', color: colors.ink },
  phone: { fontSize: 14, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  action: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  actionText: { color: colors.indigo, fontWeight: '600' },
  section: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  cell: {
    width: '31%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 8,
  },
  cellInput: { fontSize: 18, fontWeight: '600', color: colors.indigo, padding: 0 },
  cellLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
});