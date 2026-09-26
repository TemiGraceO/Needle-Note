import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { db } from '../lib/db';

interface AddOrderScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

interface Customer {
  id: number;
  name: string;
}

export default function AddOrderScreen({ onBack, onSaved }: AddOrderScreenProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    try {
      const data = db.getAllSync<Customer>('SELECT id, name FROM customers ORDER BY name ASC');
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  const handleTakeMaterialPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'The app needs camera access to save fabric pictures.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    // FIXED: Safely read the uri out of the asset array item using explicit indexing
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const snappedUri = result.assets[0]?.uri;
      if (snappedUri) {
        setImageUri(snappedUri);
      }
    }
  };

  const handleSaveOrder = () => {
    if (!selectedCustomerId) {
      Alert.alert('Selection Required', 'Please select a customer for this order.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Info', 'Please add a brief description of the chosen style.');
      return;
    }

    const orderAmount = parseInt(amount) || 0;

    try {
      const result = db.runSync(
        `INSERT INTO orders (customer_id, description, style_photo, due_date, total) 
         VALUES (?, ?, ?, ?, ?);`,
        [selectedCustomerId, description, imageUri || '', dueDate, orderAmount]
      );

      const newOrderId = result.lastInsertRowId;

      if (orderAmount > 0) {
        db.runSync(
          `INSERT INTO payments (order_id, amount) VALUES (?, ?);`,
          [newOrderId, orderAmount]
        );
      }

      onSaved();
    } catch (error) {
      console.error('Database save error:', error);
      Alert.alert('Database Error', 'Could not save the order details.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>New Order</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.inputLabel}>Link Customer</Text>
        {customers.length === 0 ? (
          <Text style={styles.errorText}>No customers found. Create a customer first!</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerChipsRow}>
            {customers.map((c) => {
              const isSelected = selectedCustomerId === c.id;
              return (
                <Pressable
                  key={c.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedCustomerId(c.id)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <Text style={styles.inputLabel}>Style Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="e.g., Agbada set with embroidery, Two piece dress"
          placeholderTextColor={colors.muted}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.inputLabel}>Material / Style Snapshot</Text>
        <Pressable style={styles.photoBox} onPress={handleTakeMaterialPhoto}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.capturedImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="photo-camera" size={32} color={colors.indigo} />
              <Text style={styles.photoText}>Tap to open camera and take picture</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.inputLabel}>Collection Due Date</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 28th October"
          placeholderTextColor={colors.muted}
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={styles.inputLabel}>Total Bill Amount (₦)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="50,000"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Pressable style={styles.saveButton} onPress={handleSaveOrder}>
          <Text style={styles.saveButtonText}>Create Active Order</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  formContainer: { padding: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 6, marginTop: 16 },
  textInput: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827' },
  textArea: { height: 80, textAlignVertical: 'top' },
  customerChipsRow: { flexDirection: 'row', marginBottom: 8, marginTop: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, marginRight: 8 },
  chipSelected: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextSelected: { color: colors.white, fontWeight: '600' },
  photoBox: { height: 160, backgroundColor: colors.white, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.line, overflow: 'hidden', marginTop: 4 },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  photoText: { fontSize: 13, color: colors.muted, marginTop: 8, textAlign: 'center' },
  capturedImage: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' },
  errorText: { color: '#EF4444', fontSize: 13, fontStyle: 'italic', marginVertical: 4 },
  saveButton: { backgroundColor: colors.indigo, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 32, marginBottom: 40 },
  saveButtonText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
