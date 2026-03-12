import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Keyboard,
  Dimensions,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design Tokens
const COLORS = {
  primary: '#7B61FF',
  background: '#FFFFFF',
  screenBackground: '#F5F5F5',
  inputBg: '#F0F0F0',
  textPrimary: '#1A1A1A',
  textSecondary: '#9E9E9E',
  textHint: '#BDBDBD',
  checkboxActive: '#7B61FF',
  sliderActive: '#7B61FF',
  sliderTrack: '#E0E0E0',
  facilityChipActiveBg: '#EDE7F6',
  facilityChipInactiveBg: '#F5F5F5',
  resetButtonBg: '#F0F0F0',
  applyButtonBg: '#7B61FF',
  border: '#E0E0E0',
};

// Storage Keys
const RECENT_SEARCHES_KEY = 'housely_recent_searches';

// Mock Search Results
const mockSearchResults = [
  { id: '1', name: 'Greenhost Boutique Hotel', location: 'Yogyakarta, Indonesia' },
  { id: '2', name: 'Grand Keisha Yogyakarta', location: 'Yogyakarta, Indonesia' },
  { id: '3', name: 'Jogja Village', location: 'Yogyakarta, Indonesia' },
  { id: '4', name: 'Ambarrukmo Plaza', location: 'Yogyakarta, Indonesia' },
  { id: '5', name: 'Hyatt Regency Yogyakarta', location: 'Yogyakarta, Indonesia' },
];

// Default Filter State
const defaultFilters = {
  lookingFor: ['rent'],
  propertyTypes: ['apartment', 'hotel'],
  priceRange: { min: 10, max: 500 },
  facilities: ['bedroom', 'bathtub', 'ac'],
};

// Search Input Component
const SearchInput = ({ query, setQuery, onClear, onFilter, inputRef }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 12,
        gap: 10,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.inputBg,
          borderRadius: 12,
          height: 44,
          paddingHorizontal: 12,
        }}
      >
        <Ionicons name="search" size={18} color={COLORS.textSecondary} />
        <TextInput
          ref={inputRef}
          placeholder="Search property..."
          placeholderTextColor={COLORS.textHint}
          value={query}
          onChangeText={setQuery}
          style={{
            flex: 1,
            marginLeft: 10,
            marginRight: 10,
            fontSize: 14,
            color: COLORS.textPrimary,
          }}
          returnKeyType="search"
          autoFocus={true}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="close" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={onFilter}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: COLORS.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="options-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// Recent Search Item
const RecentSearchItem = ({ item, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    }}
  >
    <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
    <View style={{ marginLeft: 12, flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
        {item.location}
      </Text>
    </View>
  </TouchableOpacity>
);

// Search Result Item
const SearchResultItem = ({ item, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    }}
  >
    <Ionicons name="location" size={18} color={COLORS.primary} />
    <View style={{ marginLeft: 12, flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
        {item.location}
      </Text>
    </View>
  </TouchableOpacity>
);

// Empty State Component
const SearchEmptyState = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
    <Image
      source={require('../../assets/images/opps.png')}
      style={{ width: 200, height: 160 }}
      resizeMode="contain"
    />
    <Text
      style={{
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginTop: 16,
      }}
    >
      Search not found
    </Text>
    <Text
      style={{
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginTop: 6,
        lineHeight: 20,
      }}
    >
      Please enable your location services for more optimal result
    </Text>
  </View>
);

// Checkbox Component
const Checkbox = ({ checked, onToggle, label }) => (
  <TouchableOpacity
    onPress={onToggle}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 40,
    }}
  >
    <Text style={{ fontSize: 14, color: COLORS.textPrimary }}>{label}</Text>
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: checked ? COLORS.checkboxActive : 'transparent',
        borderWidth: checked ? 0 : 1.5,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
    </View>
  </TouchableOpacity>
);

// Facility Chip Component
const FacilityChip = ({ icon, label, active, onToggle }) => (
  <TouchableOpacity
    onPress={onToggle}
    style={{
      width: 72,
      height: 68,
      borderRadius: 10,
      backgroundColor: active ? COLORS.facilityChipActiveBg : COLORS.facilityChipInactiveBg,
      borderWidth: active ? 1.5 : 0,
      borderColor: active ? COLORS.primary : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Ionicons name={icon} size={22} color={active ? COLORS.primary : COLORS.textSecondary} />
    <Text
      style={{
        fontSize: 11,
        color: active ? COLORS.primary : COLORS.textSecondary,
        marginTop: 6,
        fontWeight: '500',
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// Filter Bottom Sheet
const FilterBottomSheet = ({ visible, onClose, filters, setFilters, onApply, onReset }) => {
  const insets = useSafeAreaInsets();

  const toggleLookingFor = (value) => {
    setFilters((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(value)
        ? prev.lookingFor.filter((v) => v !== value)
        : [...prev.lookingFor, value],
    }));
  };

  const togglePropertyType = (value) => {
    setFilters((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(value)
        ? prev.propertyTypes.filter((v) => v !== value)
        : [...prev.propertyTypes, value],
    }));
  };

  const toggleFacility = (value) => {
    setFilters((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(value)
        ? prev.facilities.filter((v) => v !== value)
        : [...prev.facilities, value],
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: SCREEN_HEIGHT * 0.85,
          }}
        >
          {/* Drag Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: COLORS.border,
                borderRadius: 2,
              }}
            />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: COLORS.textPrimary,
              textAlign: 'center',
              marginVertical: 16,
            }}
          >
            Filter
          </Text>

          <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
            {/* Looking For Section */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 }}>
              Looking for
            </Text>
            <Checkbox
              checked={filters.lookingFor.includes('rent')}
              onToggle={() => toggleLookingFor('rent')}
              label="For Rent"
            />
            <Checkbox
              checked={filters.lookingFor.includes('sale')}
              onToggle={() => toggleLookingFor('sale')}
              label="For Sale"
            />

            {/* Property Type Section */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 20, marginBottom: 12 }}>
              Property Type
            </Text>
            <Checkbox
              checked={filters.propertyTypes.includes('apartment')}
              onToggle={() => togglePropertyType('apartment')}
              label="Apartment"
            />
            <Checkbox
              checked={filters.propertyTypes.includes('penthouse')}
              onToggle={() => togglePropertyType('penthouse')}
              label="Penthouse"
            />
            <Checkbox
              checked={filters.propertyTypes.includes('hotel')}
              onToggle={() => togglePropertyType('hotel')}
              label="Hotel"
            />
            <Checkbox
              checked={filters.propertyTypes.includes('villa')}
              onToggle={() => togglePropertyType('villa')}
              label="Villa"
            />
            <TouchableOpacity style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: COLORS.primary }}>
                Show all
              </Text>
            </TouchableOpacity>

            {/* Price Range Section */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 20, marginBottom: 12 }}>
              Price Range
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: COLORS.inputBg,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>Min</Text>
                <TextInput
                  value={String(filters.priceRange.min)}
                  onChangeText={(text) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: Number(text) || 0 },
                    }))
                  }
                  keyboardType="numeric"
                  style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 4 }}
                  placeholder="$10"
                  placeholderTextColor={COLORS.textHint}
                />
              </View>
              <Text style={{ color: COLORS.textSecondary }}>—</Text>
              <View
                style={{
                  flex: 1,
                  backgroundColor: COLORS.inputBg,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>Max</Text>
                <TextInput
                  value={String(filters.priceRange.max)}
                  onChangeText={(text) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: Number(text) || 0 },
                    }))
                  }
                  keyboardType="numeric"
                  style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 4 }}
                  placeholder="$800"
                  placeholderTextColor={COLORS.textHint}
                />
              </View>
            </View>

            {/* Facilities Section */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 20, marginBottom: 12 }}>
              Facilities
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <FacilityChip
                icon="bed-outline"
                label="Bed room"
                active={filters.facilities.includes('bedroom')}
                onToggle={() => toggleFacility('bedroom')}
              />
              <FacilityChip
                icon="water-outline"
                label="Bathtub"
                active={filters.facilities.includes('bathtub')}
                onToggle={() => toggleFacility('bathtub')}
              />
              <FacilityChip
                icon="snow-outline"
                label="AC"
                active={filters.facilities.includes('ac')}
                onToggle={() => toggleFacility('ac')}
              />
              <FacilityChip
                icon="wifi-outline"
                label="WiFi"
                active={filters.facilities.includes('wifi')}
                onToggle={() => toggleFacility('wifi')}
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: insets.bottom + 24,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={onReset}
              style={{
                flex: 0.4,
                backgroundColor: COLORS.resetButtonBg,
                borderRadius: 14,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', color: COLORS.textPrimary }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onApply}
              style={{
                flex: 0.6,
                backgroundColor: COLORS.applyButtonBg,
                borderRadius: 14,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', color: '#FFFFFF' }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Search Screen
const SearchScreen = () => {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const debounceRef = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length > 0) {
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (item) => {
    try {
      const updated = [item, ...recentSearches.filter((s) => s.id !== item.id)].slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const performSearch = (searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = mockSearchResults.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.location.toLowerCase().includes(lowerQuery)
    );
    setResults(filtered);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleResultPress = (item) => {
    saveRecentSearch(item);
    Keyboard.dismiss();
    router.push({ pathname: '/(tabs)/propertyDetails', params: { id: item.id } });
  };

  const handleRecentPress = (item) => {
    setQuery(item.name);
    performSearch(item.name);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    // Re-trigger search with filters
    if (query.length > 0) {
      performSearch(query);
    }
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const showResults = query.length > 0;
  const hasResults = results.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Search Input */}
      <SearchInput
        query={query}
        setQuery={setQuery}
        onClear={handleClear}
        onFilter={() => setIsFilterOpen(true)}
        inputRef={inputRef}
      />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showResults ? (
          hasResults ? (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: COLORS.textPrimary,
                      marginHorizontal: 16,
                      marginBottom: 8,
                    }}
                  >
                    Recent
                  </Text>
                  {recentSearches.slice(0, 3).map((item) => (
                    <RecentSearchItem key={item.id} item={item} onPress={handleRecentPress} />
                  ))}
                </View>
              )}

              {/* Search Results */}
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: COLORS.textPrimary,
                    marginHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  Result
                </Text>
                {results.map((item) => (
                  <SearchResultItem key={item.id} item={item} onPress={handleResultPress} />
                ))}
              </View>
            </>
          ) : (
            <SearchEmptyState />
          )
        ) : (
          // Initial state - show recent searches only
          recentSearches.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: COLORS.textPrimary,
                  marginHorizontal: 16,
                  marginBottom: 8,
                }}
              >
                Recent Searches
              </Text>
              {recentSearches.map((item) => (
                <RecentSearchItem key={item.id} item={item} onPress={handleRecentPress} />
              ))}
            </View>
          )
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
