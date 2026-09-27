import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  ListTodo,
  Timer as TimerIcon,
  Wrench,
  MessageCircle,
  User,
} from "lucide-react-native";

import { supabase } from "../core/services/supabase";
import { useAuthStore } from "../features/auth/useAuthStore";
import { AuthScreen } from "../features/auth/AuthScreen";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { ListsScreen } from "../features/lists/ListsScreen";
import { TimerScreen } from "../features/timer/TimerScreen";
import { HomeHubScreen } from "../features/home-hub/HomeHubScreen";
import { ChatScreen } from "../chat/ChatScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { useAppTheme } from "../core/theme";
import { ActivityIndicator, View } from "react-native";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  // 1. Initialize the dynamic theme for the tab bar
  const Theme = useAppTheme();

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
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
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

  // 2. Initialize the dynamic theme for the loading screen
  const Theme = useAppTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

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
      {session ? <TabNavigator /> : <AuthScreen />}
    </NavigationContainer>
  );
};
