import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setupDatabase } from './lib/db';
import { colors } from './theme/colors';

import CustomersScreen from './screens/CustomersScreen';
import AddCustomerScreen from './screens/AddCustomerScreen';
import CustomerProfileScreen from './screens/CustomerProfileScreen';
import TodayScreen from './screens/TodayScreen';
import OrdersScreen from './screens/OrdersScreen';
import AddOrderScreen from './screens/AddOrderScreen';
import MoneyScreen from './screens/MoneyScreen';

SplashScreen.preventAutoHideAsync();

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

// This is your app content, now inside the Provider
function AppContent() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('Today');
  const [stack, setStack] = useState<Route[]>([{ name: 'tabs' }]);
  const [version, setVersion] = useState(0);

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

  const push = (r: Route) => setStack((s) => [...s, r]);
  const pop = () => setStack((s) => (s.length > 1? s.slice(0, -1) : s));
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
    content = (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {tab === 'Customers'? (
            <CustomersScreen
              version={version}
              onOpen={(id) => push({ name: 'customer', id })}
              onAdd={() => push({ name: 'addCustomer' })}
            />
          ) : tab === 'Today'? (
            <TodayScreen version={version} onOpenCustomer={(id) => push({ name: 'customer', id })} />
          ) : tab === 'Orders'? (
            <OrdersScreen
              version={version}
              onAddOrder={() => push({ name: 'addOrder' })}
            />
          ) : (
            <MoneyScreen version={version} />
          )}
        </View>

        <View style={[styles.navContainer, { paddingBottom: insets.bottom || 20 }]}>
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
                    color={isActive? colors.indigo : colors.muted}
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

// Root App now provides SafeArea
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
    fontWeight: '600'
  },
});