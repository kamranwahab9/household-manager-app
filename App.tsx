import "react-native-gesture-handler"; // MUST be at the very top for Android!
import React from "react";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
