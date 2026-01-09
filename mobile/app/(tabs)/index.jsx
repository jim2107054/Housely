import {
  View,
  Text,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import axios from "axios";
import { API_URL } from "../../config";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";

const Home = () => {
  const { token } = useAuthStore();
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isFirstRender = useRef(true);

  //! Format date
  const formatingDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: pageNum,
          limit: 10,
        },
      });

      const data = response.data;

      if (!data.success) {
        Alert.alert("Error", "Failed to fetch books.");
        return;
      }

      setBooks((prev) =>
        pageNum === 1 ? data.books : [...prev, ...data.books]
      );

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to fetch books.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchBooks(1);
    }
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchBooks(page + 1);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          name={rating >= i ? "star" : "star-outline"}
          size={20}
          color={rating >= i ? "gold" : "gray"}
        />
      );
    }
    return <View className="flex flex-row gap-1">{stars}</View>;
  };

  const renderItem = ({ item }) => (
    <View className="px-2 py-4 bg-green-500/25">
      <View className="bg-white rounded-lg py-3 shadow-md">
        {/* Header */}
        <View className="flex-row items-center gap-4 px-4 py-2">
          <View className="w-10 h-10 rounded-full overflow-hidden">
            <TouchableOpacity
              onPress={() => {
                router.push(`/profile`);
              }}
            >
              <Image
                source={{ uri: item.user.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-lg font-bold">{item.user.fullname}</Text>
        </View>
        {/* Books Info */}
        <View className="mx-4 gap-[10px] flex flex-col rounded-lg">
          <Image
            source={{ uri: item.image }}
            className="w-full h-64 rounded-lg border-gray-200 border"
            resizeMode="cover"
          />
          <View className="gap-1">
            {/* Title */}
            <Text className="text-xl text-green-800 font-semibold">
              {item.title}
            </Text>
            {/* Rating */}
            <Text className="">{renderStars(item.rating)}</Text>
            {/* Caption */}
            <Text className="text-gray-700 text-md font-bold">
              {item.caption}
            </Text>
            <Text className="text-gray-500">
              {formatingDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchBooks(1, true);
        }}
        ListHeaderComponent={
          <View className="px-4 py-3 flex flex-col items-center">
            <View className="flex-row items-center gap-2">
              <Ionicons name="book" size={30} color="green" />
              <Text className="text-3xl font-bold text-green-400">
                NextPage
              </Text>
            </View>
            <Text>Discover great reads from the community</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator size="large" color="green" className="my-4" />
          ) : (
            null
          )
        }
        ListEmptyComponent={
          <View className="flex flex-1 justify-center items-center my-[50%]">
            <Ionicons name="book-outline" size={60} color="green" />
            <Text className="text-green-900 font-bold text-lg text-center mt-2">
              No books available.
            </Text>
            <Text className="text-green-800 text-center">
              Be the first to share a book!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Home;
