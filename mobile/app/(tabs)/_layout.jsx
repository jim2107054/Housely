import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import SafeScreen from "../../components/SafeScreen";

const TabLayout = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "green",
            headerShadowVisible: false,
            tabBarStyle: {
              backgroundColor: "#E5F1DC",
              borderTopWidth: 1,
              borderTopColor: "#ccc",
              paddingTop: 5,
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              title: "Create",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="add-circle-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </SafeScreen>
    </SafeAreaProvider>
  );
};

export default TabLayout;
