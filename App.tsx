import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';


// --- THEME & CORES ---
import { colors } from './theme/colors';

// --- SCREENS ---
import TodayScreen from './screens/TodayScreen';
import OrdersScreen from './screens/OrdersScreen';
import AddOrderScreen from './screens/AddOrderScreen';
import MoneyScreen from './screens/MoneyScreen';
import AddCustomerScreen from './screens/AddCustomerScreen';
import CustomerProfileScreen from './screens/CustomerProfileScreen';

type ScreenState = 'today' | 'orders' | 'add_order' | 'money' | 'add_customer' | 'customer_profile';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('today');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [refreshVersion, setRefreshVersion] = useState<number>(1);

  const triggerDataRefresh = () => {
    setRefreshVersion((prev) => prev + 1);
  };

  const navigateToCustomerProfile = (id: number) => {
    setSelectedCustomerId(id);
    setCurrentScreen('customer_profile');
  };

  const getTabActiveState = (tabName: 'today' | 'customers' | 'orders' | 'money') => {
    if (tabName === 'today' && currentScreen === 'today') return true;
    if (tabName === 'customers' && (currentScreen === 'add_customer' || currentScreen === 'customer_profile')) return true;
    if (tabName === 'orders' && (currentScreen === 'orders' || currentScreen === 'add_order')) return true;
    if (tabName === 'money' && currentScreen === 'money') return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* --- MAIN PAGE ROUTER BODY --- */}
      <View style={{ flex: 1 }}>
        {currentScreen === 'today' && (
          <TodayScreen
            version={refreshVersion}
            onOpenCustomer={navigateToCustomerProfile}
            onAddOrder={() => setCurrentScreen('add_order')}
            onAddClient={() => setCurrentScreen('add_customer')}
            onViewClients={() => setCurrentScreen('orders')}
          />
        )}

        {currentScreen === 'orders' && (
          <OrdersScreen
            version={refreshVersion}
            onAddOrder={() => setCurrentScreen('add_order')}
          />
        )}

        {currentScreen === 'add_order' && (
          <AddOrderScreen
            onBack={() => setCurrentScreen('orders')}
            onSaved={() => {
              triggerDataRefresh();
              setCurrentScreen('orders');
            }}
          />
        )}

        {currentScreen === 'add_customer' && (
          <AddCustomerScreen
            onBack={() => setCurrentScreen('today')}
            onSaved={(id) => {
              triggerDataRefresh();
              navigateToCustomerProfile(id);
            }}
          />
        )}

        {currentScreen === 'customer_profile' && selectedCustomerId !== null && (
          <CustomerProfileScreen
            id={selectedCustomerId}
            onBack={() => setCurrentScreen('today')}
            onChanged={triggerDataRefresh}
          />
        )}

        {currentScreen === 'money' && (
          <MoneyScreen version={refreshVersion} />
        )}
      </View>

      {/* --- STANDARDIZED BOTTOM NAVIGATION BAR --- */}
      {['today', 'orders', 'money', 'add_customer', 'customer_profile'].includes(currentScreen) && (
        <View style={styles.navBar}>
          
          {/* TODAY TAB */}
          <Pressable 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('today')}
          >
            <View style={[styles.topIndicator, getTabActiveState('today') && styles.topIndicatorActive]} />
            <MaterialIcons 
              name="calendar-today" 
              size={22} 
              color={getTabActiveState('today') ? colors.indigo : colors.muted} 
            />
            <Text style={[styles.navText, getTabActiveState('today') && styles.navTextActive]}>Today</Text>
          </Pressable>

          {/* CUSTOMERS TAB */}
          <Pressable 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('add_customer')}
          >
            <View style={[styles.topIndicator, getTabActiveState('customers') && styles.topIndicatorActive]} />
            <MaterialIcons 
              name="people-outline" 
              size={24} 
              color={getTabActiveState('customers') ? colors.indigo : colors.muted} 
            />
            <Text style={[styles.navText, getTabActiveState('customers') && styles.navTextActive]}>Customers</Text>
          </Pressable>

          {/* ORDERS TAB */}
          <Pressable 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('orders')}
          >
            <View style={[styles.topIndicator, getTabActiveState('orders') && styles.topIndicatorActive]} />
            <MaterialIcons 
              name="assignment" 
              size={22} 
              color={getTabActiveState('orders') ? colors.indigo : colors.muted} 
            />
            <Text style={[styles.navText, getTabActiveState('orders') && styles.navTextActive]}>Orders</Text>
          </Pressable>

          {/* MONEY TAB */}
          <Pressable 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('money')}
          >
            <View style={[styles.topIndicator, getTabActiveState('money') && styles.topIndicatorActive]} />
            <MaterialIcons 
              name="account-balance-wallet" 
              size={22} 
              color={getTabActiveState('money') ? colors.indigo : colors.muted} 
            />
            <Text style={[styles.navText, getTabActiveState('money') && styles.navTextActive]}>Money</Text>
          </Pressable>

        </View>
      )}
    </View>
  );
}

export default function App() {
  return <AppContent />;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  navBar: {
    // Pin the bar tightly to the very bottom edge of the display screen layout context
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    
    // Total physical size wrapper mapping metrics container
    height: Platform.OS === 'android' ? 92 : 76, 
    backgroundColor: colors.white,
    
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    
    // FIXED: Instead of margins, we use padding to push the icons up.
    // This keeps the white background extending all the way down behind the phone's navigation keys!
    paddingBottom: Platform.OS === 'android' ? 36 : 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  topIndicator: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 3,
    backgroundColor: 'transparent',
  },
  topIndicatorActive: {
    backgroundColor: colors.indigo,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
    marginTop: 2,
    paddingBottom: 2,
  },
  navTextActive: {
    color: colors.indigo,
    fontWeight: '600',
  },
});

