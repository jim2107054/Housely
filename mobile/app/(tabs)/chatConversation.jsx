import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import api from "../../services/api";
import { connectSocket, getSocket } from "../../services/socketService";
import useAuthStore from "../../store/authStore";

// ─── Header ──────────────────────────────────────────────────────────────────
const ConversationHeader = memo(({ name, avatar, isOnline, onBack }) => (
  <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
    <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center">
      <Ionicons name="arrow-back" size={24} color="#252B5C" />
    </TouchableOpacity>

    <View className="flex-row items-center flex-1 ml-2">
      <View className="relative">
        <Image source={{ uri: avatar }} className="w-12 h-12 rounded-full" resizeMode="cover" />
        {isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>
      <View className="ml-3">
        <Text className="text-textPrimary font-poppins-bold text-base">{name}</Text>
        <Text className="text-textSecondary font-poppins text-xs">
          {isOnline ? "Online" : "Offline"}
        </Text>
      </View>
    </View>

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
));

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = memo(({ message }) => (
  <View className={`max-w-[80%] mb-3 ${message.isMe ? "self-end" : "self-start"}`}>
    <View
      className={`px-4 py-3 rounded-2xl ${
        message.isMe ? "bg-primary rounded-br-sm" : "bg-cardBackground rounded-bl-sm"
      }`}
    >
      <Text className={`font-poppins text-sm ${message.isMe ? "text-white" : "text-textPrimary"}`}>
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
));

// ─── Input Bar ────────────────────────────────────────────────────────────────
const InputBar = memo(({ value, onChangeText, onSend }) => (
  <View className="flex-row items-center px-4 py-3 bg-white border-t border-border">
    <TouchableOpacity className="w-10 h-10 items-center justify-center">
      <Ionicons name="add-circle-outline" size={28} color="#7F56D9" />
    </TouchableOpacity>

    <View className="flex-1 flex-row items-center bg-cardBackground rounded-full px-4 py-2 mx-2">
      <TextInput
        placeholder="Type a message..."
        placeholderTextColor="#A1A5C1"
        value={value}
        onChangeText={onChangeText}
        className="flex-1 text-textPrimary font-poppins text-sm"
        multiline
        maxLength={500}
      />
      <TouchableOpacity>
        <Ionicons name="happy-outline" size={24} color="#A1A5C1" />
      </TouchableOpacity>
    </View>

    <TouchableOpacity
      onPress={onSend}
      className="w-12 h-12 bg-primary rounded-full items-center justify-center"
    >
      <Ionicons name="send" size={20} color="white" />
    </TouchableOpacity>
  </View>
));

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ChatConversation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name, avatar } = params;
  const scrollViewRef = useRef(null);
  const { user } = useAuthStore();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const typingTimeoutRef = useRef(null);

  const transformMessage = useCallback((m) => ({
    id: m.id,
    senderId: m.senderId,
    text: m.content,
    timestamp: new Date(m.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    isMe: m.senderId === user?.id,
  }), [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/conversations/${id}/messages`);
        if (!cancelled) {
          setMessages(response.data.messages.map(transformMessage));
          await api.patch(`/api/conversations/${id}/read`);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMessages();

    // Re-usable function so we can call it on every (re)connect
    const joinConversation = (sock) => {
      sock.emit('conversation:join', { conversationId: id });
    };

    const attachListeners = (sock) => {
      sock.on('message:received', (msg) => {
        if (cancelled) return;
        if (String(msg.conversationId) !== String(id)) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          if (String(msg.senderId) === String(user?.id)) {
            const tempIdx = [...prev].reverse().findIndex(
              (m) => typeof m.id === 'string' && m.id.startsWith('temp-')
            );
            if (tempIdx !== -1) {
              const realIdx = prev.length - 1 - tempIdx;
              const updated = [...prev];
              updated[realIdx] = transformMessage(msg);
              return updated;
            }
          }
          return [...prev, transformMessage(msg)];
        });
      });

      sock.on('typing:start', ({ userId: typingUserId, conversationId }) => {
        if (cancelled) return;
        if (String(conversationId) === String(id) && String(typingUserId) !== String(user?.id)) {
          setOtherUserTyping(true);
        }
      });

      sock.on('typing:stop', ({ userId: typingUserId, conversationId }) => {
        if (cancelled) return;
        if (String(conversationId) === String(id) && String(typingUserId) !== String(user?.id)) {
          setOtherUserTyping(false);
        }
      });

      sock.on('presence:update', ({ userId: presenceUserId, status }) => {
        if (cancelled) return;
        // We don't have the other party's userId directly in params,
        // but we can infer: any presence update that isn't ours affects isOnline
        if (String(presenceUserId) !== String(user?.id)) {
          setIsOnline(status === 'online');
        }
      });

      // Re-join conversation room on every reconnection so no events are missed
      sock.on('connect', () => {
        if (cancelled) return;
        joinConversation(sock);
        sock.emit('presence:online');
      });
    };

    const initSocket = async () => {
      const sock = await connectSocket();
      if (cancelled || !sock) return;

      joinConversation(sock);
      sock.emit('presence:online');
      attachListeners(sock);
    };
    initSocket();

    return () => {
      cancelled = true;
      clearTimeout(typingTimeoutRef.current);
      const sock = getSocket();
      if (sock) {
        sock.emit('conversation:leave', { conversationId: id });
        sock.off('message:received');
        sock.off('typing:start');
        sock.off('typing:stop');
        sock.off('presence:update');
        sock.off('connect');
      }
    };
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleTyping = useCallback((text) => {
    setNewMessage(text);
    const sock = getSocket();
    if (!sock?.connected) return;
    if (!isTyping) {
      setIsTyping(true);
      sock.emit('typing:start', { conversationId: id });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sock.emit('typing:stop', { conversationId: id });
    }, 1500);
  }, [id, isTyping]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage("");

    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit('typing:stop', { conversationId: id });
    }

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: user?.id,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      },
    ]);

    try {
      if (sock?.connected) {
        sock.emit('message:send', { conversationId: id, content: text, type: 'text' });
      } else {
        // REST fallback — server will emit socket events server-side
        const response = await api.post(`/api/conversations/${id}/messages`, { content: text });
        if (response.data?.id) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? transformMessage(response.data) : m))
          );
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  }, [id, newMessage, user?.id, transformMessage]);

  const handleBack = useCallback(() => router.back(), []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={0}
    >
      <ConversationHeader
        name={name || "Unknown"}
        avatar={avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
        isOnline={isOnline}
        onBack={handleBack}
      />

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
          <View className="items-center mb-4">
            <View className="bg-cardBackground px-4 py-1 rounded-full">
              <Text className="text-textSecondary font-poppins text-xs">Today</Text>
            </View>
          </View>

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {otherUserTyping && (
            <View className="self-start mb-3 max-w-[80%]">
              <View className="bg-cardBackground px-4 py-3 rounded-2xl rounded-bl-sm">
                <Text className="text-textSecondary font-poppins text-sm italic">typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <InputBar value={newMessage} onChangeText={handleTyping} onSend={sendMessage} />
    </KeyboardAvoidingView>
  );
};

export default ChatConversation;
