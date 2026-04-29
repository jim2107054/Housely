import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const useLocationStore = create((set, get) => ({
  // Default location: Khulna, Bangladesh
  defaultLocation: {
    latitude: 22.8456,
    longitude: 89.5403,
    address: "Khulna, Bangladesh",
    shortName: "Khulna, Bangladesh",
  },

  // Location state
  selectedLocation: {
    latitude: 22.8456,
    longitude: 89.5403,
    address: "Khulna, Bangladesh",
    shortName: "Khulna, Bangladesh",
  },
  locationName: "Khulna, Bangladesh",
  isLocationSet: true,

  // Set location from maps screen
  setLocation: async (latitude, longitude, address) => {
    try {
      // Parse the address to get a short display name
      const addressParts = address.split(",");
      const shortName = addressParts.length >= 2 
        ? `${addressParts[0].trim()}, ${addressParts[1].trim()}`
        : addressParts[0].trim();

      const locationData = {
        latitude,
        longitude,
        address,
        shortName,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem("userLocation", JSON.stringify(locationData));

      set({
        selectedLocation: locationData,
        locationName: shortName,
        isLocationSet: true,
      });

      return { success: true };
    } catch (error) {
      console.log("Error saving location:", error);
      return { success: false, error };
    }
  },

  // Load location from AsyncStorage on app start
  loadLocation: async () => {
    try {
      const locationJson = await AsyncStorage.getItem("userLocation");
      
      if (locationJson) {
        const locationData = JSON.parse(locationJson);
        set({
          selectedLocation: locationData,
          locationName: locationData.shortName || "Select Location",
          isLocationSet: true,
        });
        return locationData;
      }
      const { defaultLocation } = get();
      set({
        selectedLocation: defaultLocation,
        locationName: defaultLocation.shortName,
        isLocationSet: true,
      });
      return null;
    } catch (error) {
      console.log("Error loading location:", error);
      return null;
    }
  },

  // Clear location
  clearLocation: async () => {
    try {
      await AsyncStorage.removeItem("userLocation");
      const { defaultLocation } = get();
      set({
        selectedLocation: defaultLocation,
        locationName: defaultLocation.shortName,
        isLocationSet: true,
      });
    } catch (error) {
      console.log("Error clearing location:", error);
    }
  },

  // Auto-detect GPS location on app start
  detectGpsLocation: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return { success: false };
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const addressString = geocode
        ? [geocode.district, geocode.city, geocode.country]
            .filter(Boolean)
            .join(", ")
        : "Current Location";

      const { setLocation } = get();
      await setLocation(
        position.coords.latitude,
        position.coords.longitude,
        addressString
      );

      return { success: true };
    } catch (error) {
      // Silently fall back to default Khulna location — no crash, no alert
      return { success: false };
    }
  },

  // Get coordinates for filtering properties
  getCoordinates: () => {
    const { selectedLocation, defaultLocation } = get();
    if (selectedLocation) {
      return {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };
    }
    // Default to Khulna, Bangladesh if no location set
    return {
      latitude: defaultLocation.latitude,
      longitude: defaultLocation.longitude,
    };
  },
}));

export default useLocationStore;
