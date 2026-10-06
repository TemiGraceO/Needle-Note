import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text as RNText, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { setupDatabase } from './lib/db';
import { colors } from './theme/colors';

// Imports for active features screens
import CustomersScreen from './screens/CustomersScreen';
import AddCustomerScreen from './screens/AddCustomerScreen';
import CustomerProfileScreen from './screens/CustomerProfileScreen';
import TodayScreen from './screens/TodayScreen';
import OrdersScreen from './screens/OrdersScreen';
import AddOrderScreen from './screens/AddOrderScreen';
import MoneyScreen from './screens/MoneyScreen';

SplashScreen.preventAutoHideAsync();

// --- GLOBAL FONT OVERRIDE ---
// Maps the numeric/keyword fontWeight already used across the app's
// StyleSheets to the matching Poppins font file, then patches every
// <Text> to render with that family instead of the system font.
// This only needs to run once, at module scope.
const poppinsWeightMap: Record<string, string> = {
  '400': 'Poppins_400Regular',
  normal: 'Poppins_400Regular',
  '500': 'Poppins_500Medium',
  '600': 'Poppins_600SemiBold',
  '700': 'Poppins_700Bold',
  bold: 'Poppins_700Bold',
};

let fontPatchApplied = false;
function applyGlobalFontPatch() {
  if (fontPatchApplied) return;
  fontPatchApplied = true;

  const originalRender = (RNText as any).render;
  (RNText as any).render = function (...args: any[]) {
    const origin = originalRender.apply(this, args);
    const flatStyle = StyleSheet.flatten(origin.props.style) || {};
    const weightKey = String(flatStyle.fontWeight ?? '400');
    const fontFamily = poppinsWeightMap[weightKey] ?? 'Poppins_400Regular';
    return React.cloneElement(origin, {
      style: [{ fontFamily }, origin.props.style],
    });
  };
}

type Tab = 'Today' | 'Customers' | 'Orders' | 'Money';
type Route =
  | { name: 'tabs' }
  | { name: 'addCustomer' }
  | { name: 'customer'; id: number }
  | { name: 'addOrder' };

interface TabItem {
  id: Tab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const tabsConfig: TabItem[] = [
  { id: 'Today', label: 'Today', icon: 'calendar-today' },
  { id: 'Customers', label: 'Customers', icon: 'people' },
  { id: 'Orders', label: 'Orders', icon: 'assignment' },
  { id: 'Money', label: 'Money', icon: 'account-balance-wallet' },
];

function AppContent() {
  const [dbReady, setDbReady] = useState(false);
  const [tab, setTab] = useState<Tab>('Today');
  const [stack, setStack] = useState<Route[]>([{ name: 'tabs' }]);
  const [version, setVersion] = useState(0);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) applyGlobalFontPatch();
  }, [fontsLoaded]);

  useEffect(() => {
    try {
      setupDatabase();
    } catch (err) {
      console.error('Failed to set up database:', err);
    } finally {
      setDbReady(true);
    }
  }, []);

  const ready = dbReady && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  const push = (r: Route) => setStack((s) => [...s, r]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const changed = () => setVersion((v) => v + 1);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        pop();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack]);

  if (!ready) return null;

  const route = stack[stack.length - 1];
  let content;

  // --- STACK ROUTING ENGINE ---
  if (route.name === 'addCustomer') {
    content = (
      <AddCustomerScreen
        onBack={pop}
        onSaved={(id) => {
          changed();
          setStack((s) => [...s.slice(0, -1), { name: 'customer', id }]);
        }}
      />
    );
  } else if (route.name === 'addOrder') {
    content = (
      <AddOrderScreen
        onBack={pop}
        onSaved={() => {
          changed();
          pop();
        }}
      />
    );
  } else if (route.name === 'customer') {
    content = <CustomerProfileScreen id={route.id} onBack={pop} onChanged={changed} />;
  } else {
    // --- BOTTOM BAR TABS SCREENS MANIFEST ---
    content = (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {tab === 'Customers' ? (
            <CustomersScreen
              version={version}
              onOpen={(id) => push({ name: 'customer', id })}
              onAdd={() => push({ name: 'addCustomer' })}
            />
          ) : tab === 'Today' ? (
            <TodayScreen version={version} onOpenCustomer={(id) => push({ name: 'customer', id })} />
          ) : tab === 'Orders' ? (
            <OrdersScreen
              version={version}
              onAddOrder={() => push({ name: 'addOrder' })}
            />
          ) : (
            <MoneyScreen version={version} />
          )}
        </View>

        {/* BOTTOM NAV BAR INTERFACE */}
        <View style={styles.navContainer}>
          <View style={styles.nav}>
            {tabsConfig.map((t) => {
              const isActive = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  style={[styles.navItem, isActive && styles.navItemOn]}
                  onPress={() => setTab(t.id)}
                >
                  <MaterialIcons
                    name={t.icon}
                    size={22}
                    color={isActive ? colors.indigo : colors.muted}
                  />
                  <Text style={[styles.navText, isActive && styles.navTextOn]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {content}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  navContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingBottom: 20,
  },
  nav: {
    flexDirection: 'row',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 3,
    borderTopColor: 'transparent',
  },
  navItemOn: {
    borderTopColor: colors.indigo,
  },
  navText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  navTextOn: {
    color: colors.indigo,
    fontWeight: '600',
  },
});