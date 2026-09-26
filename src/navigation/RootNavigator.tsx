import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  ListTodo,
  Timer as TimerIcon,
  Wrench,
  User,
} from "lucide-react-native";

import { supabase } from "../core/services/supabase";
import { useAuthStore } from "../features/auth/useAuthStore";
import { AuthScreen } from "../features/auth/AuthScreen";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { ListsScreen } from "../features/lists/ListsScreen";
import { TimerScreen } from "../features/timer/TimerScreen";
import { HomeHubScreen } from "../features/home-hub/HomeHubScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { Theme } from "../core/theme";
import { ActivityIndicator, View } from "react-native";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsScreen}
        options={{
          tabBarIcon: ({ color }) => <ListTodo size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          tabBarIcon: ({ color }) => <TimerIcon size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="HomeHub"
        component={HomeHubScreen}
        options={{
          tabBarIcon: ({ color }) => <Wrench size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { session, setSession, isInitialized } = useAuthStore();

  useEffect(() => {
    // 1. Check if user is already logged in on app startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for login/logout events securely
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* The Gatekeeper: If session exists, show App. If not, show Login. */}
      {session ? <TabNavigator /> : <AuthScreen />}
    </NavigationContainer>
  );
};
