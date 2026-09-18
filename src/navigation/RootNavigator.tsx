import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomDockTabBar } from '../components/shell/BottomDockTabBar';
import { PageRevealOverlay } from '../components/shell/PageRevealOverlay';
import { LoadingScreen } from '../components/Screen';
import { useApp } from '../lib/store';
import { useThemeColors } from '../lib/theme-context';
import { AcademicsScreen } from '../screens/AcademicsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MapsScreen } from '../screens/MapsScreen';
import { MessScreen } from '../screens/MessScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { ServiceNewScreen } from '../screens/ServiceNewScreen';
import { ServicesListScreen } from '../screens/ServicesListScreen';
import type {
  HomeStackParamList,
  ServicesStackParamList,
  StudentStackParamList,
  StudentTabParamList,
  WardenStackParamList,
  WardenTabParamList,
} from './types';

const Root = createNativeStackNavigator();
const StudentStack = createNativeStackNavigator<StudentStackParamList>();
const WardenStack = createNativeStackNavigator<WardenStackParamList>();
const StudentTabs = createBottomTabNavigator<StudentTabParamList>();
const WardenTabs = createBottomTabNavigator<WardenTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();

const stackScreenOptions = { headerShown: false, contentStyle: { flex: 1 } };

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function ServicesNavigator() {
  return (
    <ServicesStack.Navigator screenOptions={stackScreenOptions}>
      <ServicesStack.Screen name="ServicesList" component={ServicesListScreen} />
      <ServicesStack.Screen name="ServiceNew" component={ServiceNewScreen} />
      <ServicesStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
    </ServicesStack.Navigator>
  );
}

function StudentTabsNavigator() {
  return (
    <StudentTabs.Navigator
      tabBar={(props) => <BottomDockTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { flex: 1 } }}
    >
      <StudentTabs.Screen name="Home" component={HomeNavigator} options={{ title: 'Home' }} />
      <StudentTabs.Screen name="Academics" component={AcademicsScreen} options={{ title: 'Academics' }} />
      <StudentTabs.Screen name="VMaps" component={MapsScreen} options={{ title: 'VMap' }} />
      <StudentTabs.Screen name="Services" component={ServicesNavigator} options={{ title: 'Services' }} />
      <StudentTabs.Screen name="Mess" component={MessScreen} options={{ title: 'Mess' }} />
    </StudentTabs.Navigator>
  );
}

function WardenTabsNavigator() {
  return (
    <WardenTabs.Navigator
      tabBar={(props) => <BottomDockTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { flex: 1 } }}
    >
      <WardenTabs.Screen name="Incoming" component={ServicesNavigator} options={{ title: 'Requests' }} />
      <WardenTabs.Screen name="VMaps" component={MapsScreen} options={{ title: 'VMap' }} />
    </WardenTabs.Navigator>
  );
}

function StudentApp() {
  return (
    <StudentStack.Navigator screenOptions={stackScreenOptions}>
      <StudentStack.Screen name="MainTabs" component={StudentTabsNavigator} />
      <StudentStack.Screen name="Profile" component={ProfileScreen} />
    </StudentStack.Navigator>
  );
}

function WardenApp() {
  return (
    <WardenStack.Navigator screenOptions={stackScreenOptions}>
      <WardenStack.Screen name="MainTabs" component={WardenTabsNavigator} />
      <WardenStack.Screen name="Profile" component={ProfileScreen} />
    </WardenStack.Navigator>
  );
}

function NavChrome() {
  return <PageRevealOverlay onNavigate={() => undefined} />;
}

export function RootNavigator() {
  const { ready, user } = useApp();
  const c = useThemeColors();
  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: c.isDark,
      colors: {
        ...DefaultTheme.colors,
        background: c.bg,
        card: c.paper,
        text: c.ink,
        border: c.line,
        primary: c.brandStrong,
      },
    }),
    [c],
  );

  if (!ready) return <LoadingScreen />;

  return (
    <View style={[styles.outer, { backgroundColor: c.isDark ? '#0a0a0a' : '#d4d4d8' }]}>
      <View style={styles.frame}>
        <NavigationContainer theme={navTheme}>
          <NavChrome />
          <Root.Navigator screenOptions={stackScreenOptions}>
            {!user ? (
              <Root.Screen name="Login" component={LoginScreen} />
            ) : user.role === 'warden' || user.role === 'admin' ? (
              <Root.Screen name="Warden" component={WardenApp} />
            ) : (
              <Root.Screen name="Student" component={StudentApp} />
            )}
          </Root.Navigator>
        </NavigationContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center' },
  frame: { flex: 1, width: '100%', maxWidth: 430 },
});
