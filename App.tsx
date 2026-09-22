import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { setupDatabase } from './lib/db';
import { colors } from './theme/colors';
import { ScreenHeader } from './components/ui';
import CustomersScreen from './screens/CustomersScreen';
import AddCustomerScreen from './screens/AddCustomerScreen';
import CustomerProfileScreen from './screens/CustomerProfileScreen';

SplashScreen.preventAutoHideAsync();

type Tab = 'Today' | 'Customers' | 'Orders' | 'Money';
type Route = { name: 'tabs' } | { name: 'addCustomer' } | { name: 'customer'; id: number };
const tabs: Tab[] = ['Today', 'Customers', 'Orders', 'Money'];

export default function App() {
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
  } else if (route.name === 'customer') {
    content = <CustomerProfileScreen id={route.id} onBack={pop} onChanged={changed} />;
  } else {
    content = (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {tab === 'Customers' ? (
            <CustomersScreen
              version={version}
              onOpen={(id) => push({ name: 'customer', id })}
              onAdd={() => push({ name: 'addCustomer' })}
            />
          ) : (
            <View style={{ flex: 1 }}>
              <ScreenHeader title={tab} />
              <View style={styles.center}>
                <Text style={styles.placeholder}>{tab} Not screen coming next</Text>
              </View>
            </View>
          )}
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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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