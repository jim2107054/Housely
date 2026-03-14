import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../../services/api";



const TopLocations = () => {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/houses/top-locations');
        const transformed = response.data.locations.map((loc, index) => ({
          id: String(index),
          name: loc.city,
          properties: loc._count.id,
          image: { uri: `https://source.unsplash.com/featured/?${loc.city},city` }
        }));
        setLocations(transformed);
      } catch (err) {
        console.error('Error fetching top locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Header Component
  const Header = () => (
    <View className="flex-row items-center px-5 py-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={24} color="#252B5C" />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-lg font-poppins-semibold text-textPrimary mr-10">
        Top Locations
      </Text>
    </View>
  );

  // Location Card Component
  const LocationCard = ({ item }) => (
    <TouchableOpacity 
      className="mb-4 mx-5 rounded-xl overflow-hidden"
      onPress={() => console.log(`Selected location: ${item.name}`)}
    >
      <View className="relative h-32">
        <Image
          source={item.image}
          className="w-full h-full rounded-xl"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30 rounded-xl" />
        <View className="absolute bottom-3 left-3">
          <Text className="text-white font-poppins-bold text-lg">
            {item.name}
          </Text>
          <Text className="text-white/80 font-poppins text-sm">
            {item.properties} Properties
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <Header />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6C5CE7" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {locations.map((item) => (
            <LocationCard key={item.id} item={item} />
          ))}
          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>
      )}
    </View>
  );
};

export default TopLocations;
