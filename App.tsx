import { useEffect, useState } from 'react';
import { Pressable, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { setupDatabase } from './lib/db';
import { colors } from './theme/colors';

SplashScreen.preventAutoHideAsync();

type Tab = 'Today' | 'Customers' | 'Orders' | 'Money';
const tabs: Tab[] = ['Today', 'Customers', 'Orders', 'Money'];

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('Today');

  useEffect(() => {
    try {
      setupDatabase();
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>{tab}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>{tab} screen coming next</Text>
      </View>
      <View style={styles.nav}>
        {tabs.map((t) => (
          <Pressable key={t} style={styles.navItem} onPress={() => setTab(t)}>
            <Text style={[styles.navText, tab === t && styles.navTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingTop: (RNStatusBar.currentHeight ?? 44) + 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '600', color: colors.indigo },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: colors.muted },
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    paddingBottom: 24,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navText: { fontSize: 12, color: colors.muted },
  navTextOn: { color: colors.indigo, fontWeight: '600' },
});