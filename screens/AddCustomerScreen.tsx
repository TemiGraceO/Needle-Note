import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Field, PrimaryButton, ScreenHeader } from '../components/ui';
import { addCustomer } from '../lib/customers';

type Props = { onBack: () => void; onSaved: (id: number) => void };

export default function AddCustomerScreen({ onBack, onSaved }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    if (!name.trim()) {
      setError('Please enter the customer name.');
      return;
    }
    const id = addCustomer(name, phone);
    onSaved(id);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="New customer" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Field label="Name" value={name} onChangeText={setName} placeholder="Amina Yusuf" />
        <Field
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          placeholder="080 1234 5678"
          keyboardType="phone-pad"
        />
        {error ? <Text style={{ color: colors.coral, marginBottom: 10 }}>{error}</Text> : null}
        <PrimaryButton label="Save customer" onPress={save} />
      </ScrollView>
    </View>
  );
}