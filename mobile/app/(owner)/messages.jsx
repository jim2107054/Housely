import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ownerConversations, chatConversations } from "../../data/dummyData";

//!api calls - uncomment when connecting backend
// import api from "../../services/api";
// useEffect(() => {
//   const fetchConversations = async () => {
//     const response = await api.get('/api/messages/conversations');
//     setConversations(response.data.conversations);
//   };
//   fetchConversations();
// }, []);

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
};

const OwnerMessages = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  // Use chatConversations (screen-ready format) for display
  const [conversations] = useState(chatConversations);

  const filteredConversations = conversations.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(owner)/chatConversation",
          params: { id: item.id, name: item.name },
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
      }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: item.avatar }}
          style={{ width: 52, height: 52, borderRadius: 26 }}
        />
        {item.online && (
          <View
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#4CAF50",
              borderWidth: 2,
              borderColor: "#fff",
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {item.timestamp}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <Text
            style={{ fontSize: 14, color: COLORS.textSecondary, flex: 1 }}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View
              style={{
                backgroundColor: COLORS.primary,
                width: 20,
                height: 20,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                {item.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary }}>
          Messages
        </Text>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F5F5F5",
            borderRadius: 12,
            paddingHorizontal: 14,
            marginTop: 12,
            height: 44,
          }}
        >
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, marginLeft: 8, fontSize: 15, color: COLORS.textPrimary }}
          />
        </View>
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="chatbubbles-outline" size={60} color="#E0E0E0" />
            <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginTop: 12 }}>
              No conversations yet
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default OwnerMessages;
