import { ReactNode } from 'react';
import {
  Pressable,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#E4E3F4',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.indigo, fontWeight: '600', fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && { opacity: 0.5 }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />
    </View>
  );
}

export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={{ marginRight: 12 }}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.indigo,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonText: { color: colors.cream, fontSize: 15, fontWeight: '600' },
  field: { marginBottom: 14 },
  label: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
  },
  header: {
    paddingTop: (RNStatusBar.currentHeight ?? 44) + 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', color: colors.indigo },
  back: { fontSize: 15, color: colors.indigo },
});