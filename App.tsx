import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Pressable, Platform, Animated, Dimensions, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCREEN_HIERARCHY: Record<ScreenState, number> = {
  today: 0,
  add_customer: 1,
  customer_profile: 1,
  orders: 2,
  add_order: 2,
  money: 3,
};

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('today');
  const [nextScreen, setNextScreen] = useState<ScreenState | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [refreshVersion, setRefreshVersion] = useState<number>(1);
  const [isForwardNav, setIsForwardNav] = useState<boolean>(true);

  const slideAnim = React.useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const currentSlideAnim = React.useRef(new Animated.Value(0)).current;

  const transitionTo = (targetScreen: ScreenState, customerId: number | null = null) => {
    if (targetScreen === currentScreen) return;

    const currentWeight = SCREEN_HIERARCHY[currentScreen];
    const targetWeight = SCREEN_HIERARCHY[targetScreen];
    const isForward = targetWeight >= currentWeight;
    setIsForwardNav(isForward);

    const nextStartPos = isForward ? SCREEN_WIDTH : -SCREEN_WIDTH;
    const currentEndPos = isForward ? -SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.3;

    slideAnim.setValue(nextStartPos);
    currentSlideAnim.setValue(0);
    
    setNextScreen(targetScreen);
    if (customerId !== null) setSelectedCustomerId(customerId);

    // Runs a perfectly linear timing loop for smooth, constant-speed movement
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220, // Snappy constant speed
        easing: Easing.linear, // FIXED: Absolute constant movement speed
        useNativeDriver: true,
      }),
      Animated.timing(currentSlideAnim, {
        toValue: currentEndPos,
        duration: 220,
        easing: Easing.linear, // FIXED: Absolute constant movement speed
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(targetScreen);
      setNextScreen(null);
      currentSlideAnim.setValue(0);
    });
  };

  const triggerDataRefresh = () => {
    setRefreshVersion((prev) => prev + 1);
  };

  const renderScreenContent = (screen: ScreenState) => {
    switch (screen) {
      case 'today':
        return (
          <TodayScreen
            version={refreshVersion}
            onOpenCustomer={(id) => transitionTo('customer_profile', id)}
            onAddOrder={() => transitionTo('add_order')}
            onAddClient={() => transitionTo('add_customer')}
            onViewClients={() => transitionTo('orders')}
          />
        );
      case 'orders':
        return <OrdersScreen version={refreshVersion} onAddOrder={() => transitionTo('add_order')} />;
      case 'add_order':
        return <AddOrderScreen onBack={() => transitionTo('orders')} onSaved={() => { triggerDataRefresh(); transitionTo('orders'); }} />;
      case 'add_customer':
        return <AddCustomerScreen onBack={() => transitionTo('today')} onSaved={(id) => { triggerDataRefresh(); transitionTo('customer_profile', id); }} />;
      case 'customer_profile':
        return selectedCustomerId !== null ? <CustomerProfileScreen id={selectedCustomerId} onBack={() => transitionTo('today')} onChanged={triggerDataRefresh} /> : null;
      case 'money':
        return <MoneyScreen version={refreshVersion} />;
      default:
        return null;
    }
  };

  const activeTabHighlight = nextScreen ?? currentScreen;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: currentSlideAnim }] }]}>
          {renderScreenContent(currentScreen)}
        </Animated.View>

        {nextScreen && (
          <Animated.View 
            style={[
              StyleSheet.absoluteFill, 
              { 
                transform: [{ translateX: slideAnim }], 
                backgroundColor: colors.cream,
                shadowColor: '#000',
                shadowOffset: { width: isForwardNav ? -2 : 2, height: 0 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 4
              }
            ]}
          >
            {renderScreenContent(nextScreen)}
          </Animated.View>
        )}
      </View>

      {['today', 'orders', 'money', 'add_customer', 'customer_profile'].includes(currentScreen) && (
        <View style={styles.navBar}>
          
          <Pressable style={styles.navItem} onPress={() => transitionTo('today')}>
            <View style={[styles.topIndicator, activeTabHighlight === 'today' && styles.topIndicatorActive]} />
            <MaterialIcons name="calendar-today" size={22} color={activeTabHighlight === 'today' ? colors.indigo : colors.muted} />
            <Text style={[styles.navText, activeTabHighlight === 'today' && styles.navTextActive]}>Today</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => transitionTo('add_customer')}>
            <View style={[styles.topIndicator, (activeTabHighlight === 'add_customer' || activeTabHighlight === 'customer_profile') && styles.topIndicatorActive]} />
            <MaterialIcons name="people-outline" size={24} color={(activeTabHighlight === 'add_customer' || activeTabHighlight === 'customer_profile') ? colors.indigo : colors.muted} />
            <Text style={[styles.navText, (activeTabHighlight === 'add_customer' || activeTabHighlight === 'customer_profile') && styles.navTextActive]}>Customers</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => transitionTo('orders')}>
            <View style={[styles.topIndicator, (activeTabHighlight === 'orders' || activeTabHighlight === 'add_order') && styles.topIndicatorActive]} />
            <MaterialIcons name="assignment" size={22} color={(activeTabHighlight === 'orders' || activeTabHighlight === 'add_order') ? colors.indigo : colors.muted} />
            <Text style={[styles.navText, (activeTabHighlight === 'orders' || activeTabHighlight === 'add_order') && styles.navTextActive]}>Orders</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => transitionTo('money')}>
            <View style={[styles.topIndicator, activeTabHighlight === 'money' && styles.topIndicatorActive]} />
            <MaterialIcons name="account-balance-wallet" size={22} color={activeTabHighlight === 'money' ? colors.indigo : colors.muted} />
            <Text style={[styles.navText, activeTabHighlight === 'money' && styles.navTextActive]}>Money</Text>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 104 : 84, 
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 36 : 16,
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
  },
  navTextActive: {
    color: colors.indigo,
    fontWeight: '600',
  },
});
