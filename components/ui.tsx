import React, { ReactNode } from 'react';
import {
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
      style={({ pressed }) => [
        styles.button,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.8, transform: [{ scale: 0.98 }] }
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        placeholderTextColor={colors.muted} 
        {...props} 
        style={[styles.input, props.style]} 
      />
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
  // Safe status height padding calculations
  const headerPaddingTop = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 12 : 16;

  return (
    <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.indigo} />
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { 
    color: colors.white, 
    fontSize: 15, 
    fontWeight: '600' 
  },
  field: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: colors.muted, 
    marginBottom: 6 
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: colors.ink,
    letterSpacing: -0.4
  },
  backButton: { 
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
