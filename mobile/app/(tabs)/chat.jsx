import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  PanResponder,
} from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import chat data
import { chatConversations } from "../../data/chats";

const Chat = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(chatConversations);

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
      >
        <Ionicons name="arrow-back" size={24} color="#252B5C" />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-xl font-poppins-bold text-textPrimary">
        Messages
      </Text>
      <TouchableOpacity className="w-10 h-10 items-center justify-center">
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
                params: { id: item.id, name: item.name, avatar: item.avatar },
              })
            }
            activeOpacity={0.9}
          >
            {/* Avatar with online indicator */}
            <View className="relative">
              <Image
                source={{ uri: item.avatar }}
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
                  {item.timestamp}
                </Text>
              </View>
              <Text className="text-textSecondary font-poppins text-xs mt-0.5">
                {item.role}
              </Text>
              <Text
                className="text-textSecondary font-poppins text-sm mt-1"
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Unread badge */}
            {item.unread > 0 && (
              <View className="w-6 h-6 bg-primary rounded-full items-center justify-center ml-2">
                <Text className="text-white text-xs font-poppins-bold">
                  {item.unread}
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

  return (
    <View className="flex-1 bg-white">
      <Header />
      <SearchBar />
      <ScrollView showsVerticalScrollIndicator={false}>
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
