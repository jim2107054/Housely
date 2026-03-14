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



const ChatConversation = () => {
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
    role: "User",
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
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send a new message
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
      const response = await api.post(`/api/conversations/${id}/messages`, { content: text });
      // Update with real ID from backend if needed, or just let it be
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  // Header Component
  const Header = () => (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={24} color="#252B5C" />
      </TouchableOpacity>

      {/* Avatar and info */}
      <View className="flex-row items-center flex-1 ml-2">
        <View className="relative">
          <Image
            source={{ uri: conversation.avatar }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
          {conversation.online && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>
        <View className="ml-3">
          <Text className="text-textPrimary font-poppins-bold text-base">
            {conversation.name}
          </Text>
          <Text className="text-textSecondary font-poppins text-xs">
            {conversation.online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <TouchableOpacity className="w-10 h-10 items-center justify-center">
        <Ionicons name="call-outline" size={22} color="#7F56D9" />
      </TouchableOpacity>
      <TouchableOpacity className="w-10 h-10 items-center justify-center">
        <Ionicons name="videocam-outline" size={24} color="#7F56D9" />
      </TouchableOpacity>
      <TouchableOpacity className="w-10 h-10 items-center justify-center">
        <Ionicons name="ellipsis-vertical" size={22} color="#252B5C" />
      </TouchableOpacity>
    </View>
  );

  // Message Bubble Component
  const MessageBubble = ({ message }) => (
    <View
      className={`max-w-[80%] mb-3 ${
        message.isMe ? "self-end" : "self-start"
      }`}
    >
      <View
        className={`px-4 py-3 rounded-2xl ${
          message.isMe
            ? "bg-primary rounded-br-sm"
            : "bg-cardBackground rounded-bl-sm"
        }`}
      >
        <Text
          className={`font-poppins text-sm ${
            message.isMe ? "text-white" : "text-textPrimary"
          }`}
        >
          {message.text}
        </Text>
      </View>
      <Text
        className={`text-xs font-poppins text-textSecondary mt-1 ${
          message.isMe ? "text-right" : "text-left"
        }`}
      >
        {message.timestamp}
      </Text>
    </View>
  );

  // Input Bar Component
  const InputBar = () => (
    <View className="flex-row items-center px-4 py-3 bg-white border-t border-border">
      <TouchableOpacity className="w-10 h-10 items-center justify-center">
        <Ionicons name="add-circle-outline" size={28} color="#7F56D9" />
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center bg-cardBackground rounded-full px-4 py-2 mx-2">
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor="#A1A5C1"
          value={newMessage}
          onChangeText={setNewMessage}
          className="flex-1 text-textPrimary font-poppins text-sm"
          multiline
          maxLength={500}
        />
        <TouchableOpacity>
          <Ionicons name="happy-outline" size={24} color="#A1A5C1" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={sendMessage}
        className="w-12 h-12 bg-primary rounded-full items-center justify-center"
      >
        <Ionicons name="send" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <Header />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C4DFF" />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {/* Date separator */}
          <View className="items-center mb-4">
            <View className="bg-cardBackground px-4 py-1 rounded-full">
              <Text className="text-textSecondary font-poppins text-xs">
                Today
              </Text>
            </View>
          </View>

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>
      )}

      <InputBar />
    </KeyboardAvoidingView>
  );
};

export default ChatConversation;
