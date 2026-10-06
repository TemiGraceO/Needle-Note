import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Pressable, Platform, ScrollView, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// --- THEME & CORES ---
import { colors } from './theme/colors';

// --- MAIN SWIPE TABS ---
import TodayScreen from './screens/TodayScreen';
import CustomersScreen from './screens/CustomersScreen';
import OrdersScreen from './screens/OrdersScreen';
import MoneyScreen from './screens/MoneyScreen';

// --- SLIDE-UP OVERLAYS ---
import AddOrderScreen from './screens/AddOrderScreen';
import AddCustomerScreen from './screens/AddCustomerScreen';
import CustomerProfileScreen from './screens/CustomerProfileScreen';

type MainTab = 'today' | 'customers' | 'orders' | 'money';
type NestedScreen = 'add_customer' | 'add_order' | 'customer_profile';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INDICATOR_WIDTH = SCREEN_WIDTH / 4; 

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('today');
  const [nestedScreen, setNestedScreen] = useState<NestedScreen | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [refreshVersion, setRefreshVersion] = useState<number>(1);

  const scrollRef = useRef<ScrollView>(null);
  
  // Continuously maps the exact horizontal swipe coordinates to drive sub-pixel nav updates
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Controls the vertical translation entry animation for full-page sheets
  const verticalAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const triggerDataRefresh = () => {
    setRefreshVersion((prev) => prev + 1);
  };

  const tabToPosition = (tab: MainTab): number => {
    switch (tab) {
      case 'today': return 0;
      case 'customers': return SCREEN_WIDTH;
      case 'orders': return SCREEN_WIDTH * 2;
      case 'money': return SCREEN_WIDTH * 3;
    }
  };

  const handleTabPress = (tab: MainTab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({
      x: tabToPosition(tab),
      animated: true,
    });
  };

  const handleScrollUpdate = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const computedIndex = Math.round(offsetX / SCREEN_WIDTH);
    const tabKeys: MainTab[] = ['today', 'customers', 'orders', 'money'];
    const targetedTab = tabKeys[computedIndex];
    
    if (targetedTab && activeTab !== targetedTab) {
      setActiveTab(targetedTab);
    }
  };

  // Triggers professional slide-up native overlay sheet execution
  const openNestedScreen = (screenType: NestedScreen, customerId: number | null = null) => {
    if (customerId !== null) setSelectedCustomerId(customerId);
    setNestedScreen(screenType);
    
    verticalAnim.setValue(SCREEN_HEIGHT);
    Animated.timing(verticalAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  // Triggers slide-down exit animation
  const closeNestedScreen = () => {
    Animated.timing(verticalAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setNestedScreen(null);
    });
  };

  const navigateToCustomerProfile = (id: number) => {
    openNestedScreen('customer_profile', id);
  };

  // Computes running active bottom indicator position based on scrolling percentage
  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH * 3],
    outputRange: [0, INDICATOR_WIDTH],
    extrapolate: 'clamp',
  });

  // Cross-fades tab item color values concurrently with your finger gestures
  const getTabColor = (index: number) => {
    return scrollX.interpolate({
      inputRange: [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH
      ],
      outputRange: [colors.muted, colors.indigo, colors.muted],
      extrapolate: 'clamp',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* --- HARDWARE ACCELERATED HORIZONTAL TAB SWIPER FRAMEWORK --- */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScrollUpdate }
        )}
        scrollEventThrottle={16}
        style={styles.viewPortContainer}
      >
        {/* TAB PAGE 0: DASHBOARD */}
        <View style={styles.swipePageWrapper}>
          <TodayScreen
            version={refreshVersion}
            onOpenCustomer={navigateToCustomerProfile}
            onAddOrder={() => openNestedScreen('add_order')}
            onAddClient={() => openNestedScreen('add_customer')}
            onViewClients={() => handleTabPress('customers')}
          />
        </View>

        {/* TAB PAGE 1: SEARCHABLE CUSTOMER LEDGER LIST */}
        <View style={styles.swipePageWrapper}>
          <CustomersScreen
            version={refreshVersion}
            onOpenCustomer={navigateToCustomerProfile}
            onAddClient={() => openNestedScreen('add_customer')}
          />
        </View>

        {/* TAB PAGE 2: ACTIVE ORDERS FEED */}
        <View style={styles.swipePageWrapper}>
          <OrdersScreen
            version={refreshVersion}
            onAddOrder={() => openNestedScreen('add_order')}
          />
        </View>

        {/* TAB PAGE 3: STUDIO REVENUE FINANCIALS */}
        <View style={styles.swipePageWrapper}>
          <MoneyScreen version={refreshVersion} />
        </View>
      </Animated.ScrollView>

      {/* --- DYNAMIC BOUTIQUE BOTTOM TAB BAR TRACKER CONTROLS --- */}
      <View style={styles.navBar}>
        {/* Adaptive sub-pixel moving highlight indicator bar */}
        <Animated.View 
          style={[
            styles.movingIndicatorLine, 
            { width: INDICATOR_WIDTH * 0.7, transform: [{ translateX: indicatorTranslateX }] }
          ]} 
        />
        
        {/* TODAY TAB BUTTON */}
        <Pressable style={styles.navItem} onPress={() => handleTabPress('today')}>
          <MaterialIcons name="calendar-today" size={22} color={activeTab === 'today' ? colors.indigo : colors.muted} />
          <Animated.Text style={[styles.navText, { color: getTabColor(0) }]}>Today</Animated.Text>
        </Pressable>

        {/* CUSTOMERS TAB BUTTON */}
        <Pressable style={styles.navItem} onPress={() => handleTabPress('customers')}>
          <MaterialIcons name="people-outline" size={24} color={activeTab === 'customers' ? colors.indigo : colors.muted} />
          <Animated.Text style={[styles.navText, { color: getTabColor(1) }]}>Customers</Animated.Text>
        </Pressable>

        {/* ORDERS TAB BUTTON */}
        <Pressable style={styles.navItem} onPress={() => handleTabPress('orders')}>
          <MaterialIcons name="assignment" size={22} color={activeTab === 'orders' ? colors.indigo : colors.muted} />
          <Animated.Text style={[styles.navText, { color: getTabColor(2) }]}>Orders</Animated.Text>
        </Pressable>

        {/* MONEY TAB BUTTON */}
        <Pressable style={styles.navItem} onPress={() => handleTabPress('money')}>
          <MaterialIcons name="account-balance-wallet" size={22} color={activeTab === 'money' ? colors.indigo : colors.muted} />
          <Animated.Text style={[styles.navText, { color: getTabColor(3) }]}>Money</Animated.Text>
        </Pressable>
      </View>

      {/* --- FULL PAGE TRANSITION SHEET OVERLAY LAYERS --- */}
      {nestedScreen !== null && (
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { transform: [{ translateY: verticalAnim }], backgroundColor: colors.cream }
          ]}
        >
          {nestedScreen === 'add_customer' && (
            <AddCustomerScreen
              onBack={closeNestedScreen}
              onSaved={(id) => {
                triggerDataRefresh();
                closeNestedScreen();
                navigateToCustomerProfile(id);
              }}
            />
          )}

          {nestedScreen === 'add_order' && (
            <AddOrderScreen
              onBack={closeNestedScreen}
              onSaved={() => {
                triggerDataRefresh();
                closeNestedScreen();
                handleTabPress('orders');
              }}
            />
          )}

          {nestedScreen === 'customer_profile' && selectedCustomerId !== null && (
            <CustomerProfileScreen
              id={selectedCustomerId}
              onBack={closeNestedScreen}
              onChanged={triggerDataRefresh}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  viewPortContainer: {
    flex: 1,
  },
  swipePageWrapper: {
    width: SCREEN_WIDTH,
    height: '100%',
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
  },
  movingIndicatorLine: {
    position: 'absolute',
    top: 0,
    left: (INDICATOR_WIDTH * 0.3) / 2, 
    height: 3,
    backgroundColor: colors.indigo,
    borderRadius: 2,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
