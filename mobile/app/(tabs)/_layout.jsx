import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import SafeScreen from "../../components/SafeScreen";

// Example: Import your custom icons (uncomment and adjust paths as needed)
const homeIcon = require("../../assets/images/profile-icons/home.png");
const exploreIcon = require("../../assets/images/profile-icons/explore.png");
const favoriteIcon = require("../../assets/images/profile-icons/heart.png");
const bookingIcon = require("../../assets/images/profile-icons/document.png");
const profileIcon = require("../../assets/images/profile-icons/profile.png");

const TabLayout = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#7F56D9",
            tabBarInactiveTintColor: "#B0B0B0",
            headerShadowVisible: false,
            tabBarStyle: {
              backgroundColor: "#FFFFFF",
              borderTopWidth: 1,
              borderTopColor: "#E0E0E0",
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
                // <Ionicons name="home" size={size} color={color} />
                // For custom icons, use this instead:
                 <Image 
                   source={homeIcon} 
                   style={{ width: size, height: size, tintColor: color }}
                   resizeMode="contain"
                 />
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color, size }) => (
                //  <Ionicons name="search" size={size} color={color} />
                // For custom icons, use this instead:
                 <Image
                    source={exploreIcon}
                    style={{ width: size, height: size, tintColor: color }}
                    resizeMode="contain"
                 />
              ),
            }}
          />
          <Tabs.Screen
            name="favorite"
            options={{
              title: "Favorite",
              tabBarIcon: ({ color, size }) => (
                 <Image
                    source={favoriteIcon}
                    style={{ width: size, height: size, tintColor: color }}
                    resizeMode="contain"
                 />
              ),
            }}
          />
          <Tabs.Screen
            name="myBooking"
            options={{
              title: "My Booking",
              tabBarIcon: ({ color, size }) => (
                 <Image
                    source={bookingIcon}
                    style={{ width: size, height: size, tintColor: color }}
                    resizeMode="contain"
                 />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                 <Image
                    source={profileIcon}
                    style={{ width: size, height: size, tintColor: color }}
                    resizeMode="contain"
                 />
              ),
            }}
          />
          <Tabs.Screen
            name="editProfile"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </SafeScreen>
    </SafeAreaProvider>
  );
};

export default TabLayout;
