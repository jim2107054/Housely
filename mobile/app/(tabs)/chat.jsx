import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  PanResponder,
  RefreshControl,
} from "react-native";
import { useState, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

import api from "../../services/api";
import { connectSocket, getSocket } from "../../services/socketService";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import useAuthStore from "../../store/authStore";



const Chat = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await api.get('/api/conversations');
      const transformedConversations = (response.data.conversations || []).map((c) => {
        const otherUser = c.userId === user?.id ? c.agent : c.user;
        const lastMsg = c.messages?.[0];
        return {
          id: c.id,
          name: otherUser?.name || otherUser?.username || 'Unknown',
          lastMessage: lastMsg?.content || 'No message yet',
          time: lastMsg?.createdAt
            ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          unreadCount: c.unreadCount || 0,
          image: otherUser?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
          online: true,
        };
      });
      setConversations(transformedConversations);
    } catch (err) {
      console.error('[Chat] Error fetching conversations:', err);
      setError(err.request ? 'Cannot connect to server' : 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations({ silent: false });

    // Listen for new messages via socket to refresh conversations list
    let sock;
    const initSocket = async () => {
      sock = await connectSocket();
      if (!sock) return;
      sock.on('message:new', () => fetchConversations({ silent: true }));
    };
    initSocket();

    return () => {
      if (sock) sock.off('message:new');
    };
  }, [fetchConversations]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations({ silent: true });
    }, [fetchConversations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations({ silent: true });
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete a conversation
  const deleteConversation = (id) => {
    setConversations((prev) => prev.filter((chat) => chat.id !== id));
  };

  // Header Component
  const Header = () => (
    <View className="flex-row items-center px-5 py-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 items-center justify-center"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#252B5C" />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-xl font-poppins-bold text-textPrimary">
        Messages
      </Text>
      <TouchableOpacity className="w-10 h-10 items-center justify-center" activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={24} color="#252B5C" />
      </TouchableOpacity>
    </View>
  );

  // Search Bar Component
  const SearchBar = () => (
    <View className="mx-5 mb-4">
      <View className="flex-row items-center bg-cardBackground rounded-xl py-3 px-4 border border-border">
        <Ionicons name="search-outline" size={20} color="#A1A5C1" />
        <TextInput
          placeholder="Search messages..."
          placeholderTextColor="#A1A5C1"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-3 text-textPrimary font-poppins text-sm"
        />
      </View>
    </View>
  );

  // Swipeable Chat Card Component
  const ChatCard = ({ item }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isSwipeOpen, setIsSwipeOpen] = useState(false);

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(gestureState.dx, -120));
          } else if (isSwipeOpen) {
            translateX.setValue(Math.min(-120 + gestureState.dx, 0));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -50) {
            Animated.spring(translateX, {
              toValue: -120,
              useNativeDriver: true,
            }).start();
            setIsSwipeOpen(true);
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            setIsSwipeOpen(false);
          }
        },
      })
    ).current;

    const closeSwipe = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setIsSwipeOpen(false);
    };

    return (
      <View className="relative mx-5 mb-3 overflow-hidden rounded-2xl">
        {/* Action buttons behind the card */}
        <View className="absolute right-0 top-0 bottom-0 flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              closeSwipe();
              console.log("More options for", item.name);
            }}
            className="w-14 h-full bg-blue-500 items-center justify-center"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            <Text className="text-white text-xs font-poppins mt-1">More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              closeSwipe();
              deleteConversation(item.id);
            }}
            className="w-14 h-full bg-red-500 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text className="text-white text-xs font-poppins mt-1">Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Main card content */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [{ translateX }] }}
        >
          <TouchableOpacity
            className="flex-row items-center bg-white p-4 border border-border rounded-2xl"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/chatConversation",
                params: { id: item.id, name: item.name, avatar: item.image },
              })
            }
            activeOpacity={0.9}
          >
            {/* Avatar with online indicator */}
            <View className="relative">
              <Image
                source={{ uri: item.image }}
                className="w-14 h-14 rounded-full"
                resizeMode="cover"
              />
              {item.online && (
                <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </View>

            {/* Chat info */}
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-textPrimary font-poppins-bold text-base"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-textSecondary font-poppins text-xs">
                  {item.time}
                </Text>
              </View>

              <Text
                className="text-textSecondary font-poppins text-sm mt-1"
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Unread badge */}
            {item.unreadCount > 0 && (
              <View className="w-6 h-6 bg-primary rounded-full items-center justify-center ml-2">
                <Text className="text-white text-xs font-poppins-bold">
                  {item.unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Empty State Component
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="chatbubbles-outline" size={64} color="#DADADA" />
      <Text className="text-textSecondary font-poppins-semibold text-lg mt-4">
        No messages yet
      </Text>
      <Text className="text-textSecondary font-poppins text-sm mt-2 text-center px-10">
        Start a conversation with property agents
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#6941C6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
          <Ionicons name="cloud-offline-outline" size={64} color="#A1A5C1" />
          <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "700", color: "#252B5C", textAlign: "center" }}>
            Connection Error
          </Text>
          <Text style={{ marginTop: 6, fontSize: 14, color: "#A1A5C1", textAlign: "center" }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchConversations({ silent: false })}
            activeOpacity={0.7}
            style={{ marginTop: 16, backgroundColor: "#6941C6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: "#FFF", fontWeight: "700" }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header />
      <SearchBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6941C6"]} tintColor="#6941C6" />}
      >
        {filteredConversations.length > 0 ? (
          filteredConversations.map((item) => (
            <ChatCard key={item.id} item={item} />
          ))
        ) : (
          <EmptyState />
        )}
        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default Chat;
