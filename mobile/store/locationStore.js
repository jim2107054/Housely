import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useLocationStore = create((set, get) => ({
  // Location state
  selectedLocation: null,
  locationName: "Select Location",
  isLocationSet: false,

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
      set({
        selectedLocation: null,
        locationName: "Select Location",
        isLocationSet: false,
      });
    } catch (error) {
      console.log("Error clearing location:", error);
    }
  },

  // Get coordinates for filtering properties
  getCoordinates: () => {
    const { selectedLocation } = get();
    if (selectedLocation) {
      return {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };
    }
    // Default to Yogyakarta if no location set
    return {
      latitude: -7.7956,
      longitude: 110.3695,
    };
  },
}));

export default useLocationStore;
