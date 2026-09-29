import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
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

const Tab = createMaterialTopTabNavigator();

const TabNavigator = () => {
  const Theme = useAppTheme();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textSecondary,
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        swipeEnabled: true,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          borderTopWidth: 1,
          height: 65,
        },
        tabBarIndicatorStyle: {
          backgroundColor: Theme.colors.primary,
          height: 3,
          top: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          textTransform: "none",
          margin: 0,
        },
        tabBarItemStyle: {
          padding: 0,
          justifyContent: "center",
          alignItems: "center",
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
