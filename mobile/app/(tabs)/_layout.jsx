import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom icons
const homeIcon = require("../../assets/images/profile-icons/home.png");
const exploreIcon = require("../../assets/images/profile-icons/explore.png");
const favoriteIcon = require("../../assets/images/profile-icons/heart.png");
const bookingIcon = require("../../assets/images/profile-icons/document.png");
const profileIcon = require("../../assets/images/profile-icons/profile.png");

const TabLayout = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6941C6",
        tabBarInactiveTintColor: "#A1A5C1",
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 11,
        },
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
      
      {/* Hidden Screens */}
      <Tabs.Screen name="editProfile" options={{ href: null }} />
      <Tabs.Screen name="popular" options={{ href: null }} />
      <Tabs.Screen name="propertyDetails" options={{ href: null }} />
      <Tabs.Screen name="recommended" options={{ href: null }} />
      <Tabs.Screen name="nearby" options={{ href: null }} />
      <Tabs.Screen name="topLocations" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="chatConversation" options={{ href: null }} />
      <Tabs.Screen name="paymentHistory" options={{ href: null }} />
      <Tabs.Screen name="notificationSettings" options={{ href: null }} />
      <Tabs.Screen name="recentViewed" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="writeReview" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
};

export default TabLayout;
