import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  FlatList,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import useLocationStore from "../../store/locationStore";

const { width, height } = Dimensions.get("window");

const Maps = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webViewRef = useRef(null);
  
  // Default location (Yogyakarta, Indonesia)
  const defaultLocation = {
    latitude: -7.7956,
    longitude: 110.3695,
  };

  const [selectedLocation, setSelectedLocation] = useState({
    latitude: params.latitude ? parseFloat(params.latitude) : defaultLocation.latitude,
    longitude: params.longitude ? parseFloat(params.longitude) : defaultLocation.longitude,
    address: params.address || "",
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Debounce timer for search
  const searchTimeoutRef = useRef(null);

  // Search location using Nominatim (OpenStreetMap's geocoding service)
  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            "User-Agent": "HouselyApp/1.0",
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.log("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(text);
    }, 500);
  };

  // Handle selecting a search result
  const handleSelectSearchResult = (result) => {
    const newLocation = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
    };
    
    setSelectedLocation(newLocation);
    setSearchQuery(result.display_name.split(",")[0]);
    setShowSearchResults(false);
    Keyboard.dismiss();

    // Update map center
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        map.setView([${newLocation.latitude}, ${newLocation.longitude}], 16);
        if (marker) {
          marker.setLatLng([${newLocation.latitude}, ${newLocation.longitude}]);
        }
        true;
      `);
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "HouselyApp/1.0",
          },
        }
      );
      const data = await response.json();
      return data.display_name || "Selected location";
    } catch (error) {
      console.log("Reverse geocode error:", error);
      return "Selected location";
    }
  };

  // Handle map tap (message from WebView)
  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === "mapClick") {
        const address = await reverseGeocode(data.lat, data.lng);
        setSelectedLocation({
          latitude: data.lat,
          longitude: data.lng,
          address: address,
        });
      } else if (data.type === "mapReady") {
        setMapReady(true);
      }
    } catch (error) {
      console.log("WebView message error:", error);
    }
  };

  // Get setLocation from store
  const { setLocation } = useLocationStore();

  // Handle choosing the location
  const handleChooseLocation = async () => {
    if (!selectedLocation.address) {
      Alert.alert("No Location Selected", "Please select a location on the map first.");
      return;
    }

    // Save location to store (persists to AsyncStorage)
    await setLocation(
      selectedLocation.latitude,
      selectedLocation.longitude,
      selectedLocation.address
    );

    // Navigate back to home
    router.replace("/(tabs)");
  };

  // OpenStreetMap HTML with Leaflet
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        #map {
          width: 100%;
          height: 100%;
        }
        .custom-marker {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-pin {
          width: 30px;
          height: 30px;
          background: #F9A826;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        }
        .marker-pin::after {
          content: '';
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #333 !important;
          border: none !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map', {
          zoomControl: true,
          attributionControl: false,
        }).setView([${selectedLocation.latitude}, ${selectedLocation.longitude}], 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Custom marker icon
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-pin"></div>',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        // Add marker
        let marker = L.marker([${selectedLocation.latitude}, ${selectedLocation.longitude}], {
          icon: markerIcon,
          draggable: true,
        }).addTo(map);

        // Handle marker drag
        marker.on('dragend', function(e) {
          const latlng = e.target.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick',
            lat: latlng.lat,
            lng: latlng.lng
          }));
        });

        // Handle map click
        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        });

        // Notify React Native that map is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      </script>
    </body>
    </html>
  `;

  return (
    <View className="flex-1 bg-white">
      {/* Map WebView */}
      <View className="flex-1">
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={{ flex: 1 }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="absolute inset-0 items-center justify-center bg-white">
              <ActivityIndicator size="large" color="#7F56D9" />
              <Text className="mt-3 text-textSecondary font-poppins">Loading map...</Text>
            </View>
          )}
        />

        {/* Header with Back Button and Search */}
        <View className="absolute top-0 left-0 right-0 pt-4 px-4 z-10">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md mb-3"
          >
            <Ionicons name="arrow-back" size={22} color="#252B5C" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View className="relative">
            <View className="flex-row items-center bg-white rounded-xl shadow-md px-4 py-3">
              <Ionicons name="search-outline" size={20} color="#A1A5C1" />
              <TextInput
                placeholder="Search Location"
                placeholderTextColor="#A1A5C1"
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
                className="flex-1 ml-3 text-textPrimary font-poppins text-sm"
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#7F56D9" />
              )}
              {searchQuery.length > 0 && !isSearching && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#A1A5C1" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <View className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-lg max-h-60 overflow-hidden z-20">
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.place_id.toString()}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectSearchResult(item)}
                      className="flex-row items-center px-4 py-3 border-b border-border"
                    >
                      <View className="w-8 h-8 rounded-full bg-cardBackground items-center justify-center mr-3">
                        <Ionicons name="location" size={16} color="#7F56D9" />
                      </View>
                      <Text 
                        className="flex-1 text-textPrimary font-poppins text-sm"
                        numberOfLines={2}
                      >
                        {item.display_name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </View>

        {/* Location Details Card */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
          <View className="bg-white rounded-2xl p-5 shadow-lg">
            <Text className="text-lg font-poppins-semibold text-textPrimary mb-3">
              Location Details
            </Text>
            
            <View className="flex-row items-start mb-5">
              <View className="w-6 h-6 rounded-full bg-cardBackground items-center justify-center mr-3 mt-0.5">
                <View className="w-3 h-3 rounded-full bg-primary" />
              </View>
              <Text 
                className="flex-1 text-textSecondary font-poppins text-sm leading-5"
                numberOfLines={2}
              >
                {selectedLocation.address || "Tap on the map to select a location"}
              </Text>
            </View>

            {/* Choose Location Button */}
            <TouchableOpacity
              onPress={handleChooseLocation}
              className="bg-primary rounded-xl py-4 items-center"
            >
              <Text className="text-white font-poppins-semibold text-base">
                Choose location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Maps;
