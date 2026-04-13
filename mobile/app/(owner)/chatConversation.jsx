import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";
import { ActivityIndicator } from "react-native";



const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
};

const OwnerChatConversation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name, avatar } = params;
  const scrollViewRef = useRef(null);
  const { user } = useAuthStore();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const conversation = {
    name: name || "Unknown",
    avatar: avatar || "https://randomuser.me/api/portraits/men/1.jpg",
    online: false,
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/conversations/${id}/messages`);
        const transformed = response.data.messages.map(m => ({
          id: m.id,
          senderId: m.senderId,
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: m.senderId === user.id,
        }));
        setMessages(transformed);
        
        // Mark as read
        await api.patch(`/api/conversations/${id}/read`);
      } catch (err) {
        console.error('Error fetching owner messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const text = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const messageObj = {
      id: tempId,
      senderId: user.id,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages((prev) => [...prev, messageObj]);

    try {
      await api.post(`/api/conversations/${id}/messages`, { content: text });
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Image
          source={{ uri: conversation.avatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary }}>
            {conversation.name}
          </Text>
          <Text style={{ fontSize: 12, color: conversation.online ? "#4CAF50" : COLORS.textSecondary }}>
            {conversation.online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                alignSelf: msg.isMe ? "flex-end" : "flex-start",
                maxWidth: "78%",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: msg.isMe ? COLORS.primary : "#fff",
                  borderRadius: 16,
                  borderTopRightRadius: msg.isMe ? 4 : 16,
                  borderTopLeftRadius: msg.isMe ? 16 : 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text style={{ fontSize: 15, color: msg.isMe ? "#fff" : COLORS.textPrimary, lineHeight: 20 }}>
                  {msg.text}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.textSecondary,
                  marginTop: 4,
                  alignSelf: msg.isMe ? "flex-end" : "flex-start",
                }}
              >
                {msg.timestamp}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          paddingBottom: 30,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        }}
      >
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          style={{
            flex: 1,
            backgroundColor: "#F5F5F5",
            borderRadius: 24,
            paddingHorizontal: 18,
            paddingVertical: 12,
            fontSize: 15,
            color: COLORS.textPrimary,
            marginRight: 10,
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OwnerChatConversation;
