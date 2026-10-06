import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from './lib/db'; // ADJUST: use whatever lib/db actually exports
import { colors } from './theme/colors';

type Props = {
  onBack: () => void;
  onSaved: (id: number) => void;
};

export default function AddCustomerScreen({ onBack, onSaved }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert('Name needed', 'Please enter the customer\'s name.');
      return;
    }
    if (saving) return;
    setSaving(true);

    try {
      // ADJUST: table and column names must match your setupDatabase()
      const result = db.runSync(
        'INSERT INTO customers (name, phone, notes) VALUES (?, ?, ?)',
        [cleanName, phone.trim(), notes.trim()]
      );
      onSaved(Number(result.lastInsertRowId));
    } catch (err) {
      console.error('Failed to save customer:', err);
      Alert.alert('Could not save', 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.indigo} />
        </Pressable>
        <Text style={styles.title}>New customer</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Amaka Obi"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 0803 000 0000"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Description / notes</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Preferences, fit notes, anything to remember"
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
          />

          <Pressable
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save customer'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white,
  },
  backBtn: { width: 32, alignItems: 'flex-start' },
  title: { fontSize: 18, fontWeight: '600', color: colors.indigo },
  form: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
  },
  multiline: { minHeight: 100 },
  saveBtn: {
    backgroundColor: colors.indigo,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});