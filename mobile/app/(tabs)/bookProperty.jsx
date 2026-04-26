import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";

// ─── Simple Calendar Picker Component ───
const CalendarPicker = ({ visible, onClose, onSelect, selectedDate, minDate, title }) => {
  const today = new Date();
  const min = minDate ? new Date(minDate) : today;
  min.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(min.getFullYear());
  const [viewMonth, setViewMonth] = useState(min.getMonth());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Empty slots before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [viewYear, viewMonth, daysInMonth, firstDayOfWeek]);

  const isDisabled = (day) => {
    if (!day) return true;
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    return date < min;
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const sel = new Date(selectedDate);
    return sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && sel.getDate() === day;
  };

  const isToday = (day) => {
    if (!day) return false;
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayPress = (day) => {
    if (isDisabled(day)) return;
    const date = new Date(viewYear, viewMonth, day, 12, 0, 0);
    onSelect(date);
    onClose();
  };

  // Can go previous only if current view is after min date's month
  const canGoPrev = viewYear > min.getFullYear() || (viewYear === min.getFullYear() && viewMonth > min.getMonth());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <TouchableOpacity activeOpacity={1} style={{
          backgroundColor: "#FFF",
          borderRadius: 24,
          width: "90%",
          maxWidth: 380,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Title */}
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", textAlign: "center", marginBottom: 16 }}>
            {title || "Select Date"}
          </Text>

          {/* Month Navigation */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              disabled={!canGoPrev}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: canGoPrev ? "#F8F5FF" : "#F5F5F5",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={20} color={canGoPrev ? "#7F56D9" : "#CCC"} />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>
              {monthNames[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: "#F8F5FF",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-forward" size={20} color="#7F56D9" />
            </TouchableOpacity>
          </View>

          {/* Day Names */}
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {dayNames.map((d) => (
              <View key={d} style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#9E9E9E" }}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Day Grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {calendarDays.map((day, idx) => {
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const todayDay = isToday(day);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => day && handleDayPress(day)}
                  disabled={disabled}
                  style={{
                    width: "14.28%",
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {day ? (
                    <View
                      style={{
                        width: 36, height: 36,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected ? "#7F56D9" : todayDay ? "#F8F5FF" : "transparent",
                        borderWidth: todayDay && !selected ? 1.5 : 0,
                        borderColor: "#7F56D9",
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: selected || todayDay ? "700" : "500",
                        color: selected ? "#FFF" : disabled ? "#D0D0D0" : "#1A1A1A",
                      }}>
                        {day}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Main Booking Screen ───
const BookProperty = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    propertyId,
    propertyName,
    propertyLocation,
    propertyImage,
    propertyPrice,
    propertyPriceType,
    propertyStatus,
  } = params;

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [notes, setNotes] = useState("");
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const formatDateLong = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Calculate duration and total cost
  const bookingDetails = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const diffMs = new Date(checkOut) - new Date(checkIn);
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const price = parseFloat(propertyPrice) || 0;
    let totalAmount = 0;

    if (propertyPriceType === "month") {
      const months = days / 30;
      totalAmount = Math.ceil(price * months);
    } else {
      totalAmount = price;
    }

    return { days, totalAmount };
  }, [checkIn, checkOut, propertyPrice, propertyPriceType]);

  const handleCheckInSelect = (date) => {
    setCheckIn(date);
    // Reset checkout if it's before the new check-in
    if (checkOut && date >= checkOut) {
      setCheckOut(null);
    }
  };

  const handleSubmitBooking = async () => {
    if (!checkIn || !checkOut) {
      Alert.alert("Missing Dates", "Please select both check-in and check-out dates.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/api/bookings", {
        houseId: propertyId,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        notes: notes.trim() || undefined,
      });

      if (response.data) {
        setShowSuccess(true);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create booking. Please try again.";
      Alert.alert("Booking Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    router.push("/(tabs)/myBooking");
  };

  // Get minimum date for checkout (day after check-in)
  const getCheckOutMinDate = () => {
    if (!checkIn) return new Date();
    const nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
          position: "relative",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            left: 20,
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#F8F5FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#7F56D9" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A" }}>
          Book Property
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Property Summary Card */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            backgroundColor: "#FFF",
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: "#F0F0F0",
            flexDirection: "row",
            shadowColor: "#7F56D9",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          {propertyImage ? (
            <Image
              source={{ uri: propertyImage }}
              style={{
                width: 90,
                height: 90,
                borderRadius: 16,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 16,
                backgroundColor: "#F8F5FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="home" size={36} color="#7F56D9" />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 14, justifyContent: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }} numberOfLines={2}>
              {propertyName || "Property"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <Ionicons name="location" size={14} color="#7F56D9" />
              <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 4 }} numberOfLines={1}>
                {propertyLocation || ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#7F56D9" }}>
                ${parseFloat(propertyPrice || 0).toLocaleString()}
              </Text>
              <Text style={{ fontSize: 13, color: "#9E9E9E", marginLeft: 2 }}>
                /{propertyPriceType || "month"}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 16 }}>
            Select Dates
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            {/* Check-in */}
            <TouchableOpacity
              onPress={() => setShowCheckInPicker(true)}
              style={{
                flex: 1,
                backgroundColor: checkIn ? "#F8F5FF" : "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1.5,
                borderColor: checkIn ? "#7F56D9" : "#E5E7EB",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: checkIn ? "#7F56D9" : "#E5E7EB",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="calendar" size={16} color={checkIn ? "#FFF" : "#9E9E9E"} />
                </View>
                <Text style={{ fontSize: 12, color: "#9E9E9E", fontWeight: "600", marginLeft: 8 }}>
                  CHECK-IN
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: checkIn ? "#1A1A1A" : "#BDBDBD",
                }}
              >
                {formatDate(checkIn) || "Select date"}
              </Text>
            </TouchableOpacity>

            {/* Check-out */}
            <TouchableOpacity
              onPress={() => {
                if (!checkIn) {
                  Alert.alert("Select Check-in First", "Please select a check-in date first.");
                  return;
                }
                setShowCheckOutPicker(true);
              }}
              style={{
                flex: 1,
                backgroundColor: checkOut ? "#F8F5FF" : "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1.5,
                borderColor: checkOut ? "#7F56D9" : "#E5E7EB",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: checkOut ? "#7F56D9" : "#E5E7EB",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="calendar" size={16} color={checkOut ? "#FFF" : "#9E9E9E"} />
                </View>
                <Text style={{ fontSize: 12, color: "#9E9E9E", fontWeight: "600", marginLeft: 8 }}>
                  CHECK-OUT
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: checkOut ? "#1A1A1A" : "#BDBDBD",
                }}
              >
                {formatDate(checkOut) || "Select date"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 12 }}>
            Additional Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special requests or notes for the agent..."
            placeholderTextColor="#BDBDBD"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              padding: 16,
              fontSize: 14,
              color: "#1A1A1A",
              minHeight: 100,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              lineHeight: 22,
            }}
          />
        </View>

        {/* Booking Summary */}
        {bookingDetails && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 24,
              backgroundColor: "#F8F5FF",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#E9DEFF",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 16 }}>
              Booking Summary
            </Text>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>Check-in</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
                  {formatDateLong(checkIn)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>Check-out</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
                  {formatDateLong(checkOut)}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: "#E9DEFF", marginVertical: 4 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>Duration</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
                  {bookingDetails.days} {bookingDetails.days === 1 ? "day" : "days"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  Price ({propertyPriceType === "month" ? "per month" : "total"})
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
                  ${parseFloat(propertyPrice || 0).toLocaleString()}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: "#E9DEFF", marginVertical: 4 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>Estimated Total</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#7F56D9" }}>
                  ${bookingDetails.totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <View style={{ marginHorizontal: 20, marginTop: 28 }}>
          <TouchableOpacity
            onPress={handleSubmitBooking}
            disabled={submitting || !checkIn || !checkOut}
            style={{
              backgroundColor: !checkIn || !checkOut ? "#D0C0F0" : "#7F56D9",
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              shadowColor: "#7F56D9",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: !checkIn || !checkOut ? 0 : 0.3,
              shadowRadius: 12,
              elevation: !checkIn || !checkOut ? 0 : 6,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 18 }}>
                  Confirm Booking
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <Ionicons name="information-circle" size={18} color="#9E9E9E" style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 12, color: "#9E9E9E", flex: 1, lineHeight: 18 }}>
            Your booking will be sent to the property agent for confirmation. You can cancel free of charge up to 24 hours before check-in.
          </Text>
        </View>
      </ScrollView>

      {/* Calendar Modals */}
      <CalendarPicker
        visible={showCheckInPicker}
        onClose={() => setShowCheckInPicker(false)}
        onSelect={handleCheckInSelect}
        selectedDate={checkIn}
        minDate={new Date()}
        title="Select Check-in Date"
      />
      <CalendarPicker
        visible={showCheckOutPicker}
        onClose={() => setShowCheckOutPicker(false)}
        onSelect={setCheckOut}
        selectedDate={checkOut}
        minDate={getCheckOutMinDate()}
        title="Select Check-out Date"
      />

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 28,
              padding: 32,
              alignItems: "center",
              width: "85%",
              maxWidth: 360,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#F0FFF4",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 8, textAlign: "center" }}>
              Booking Submitted!
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 24 }}>
              Your booking request for {propertyName} has been sent to the agent. You'll be notified once it's confirmed.
            </Text>
            <TouchableOpacity
              onPress={handleSuccessDismiss}
              style={{
                backgroundColor: "#7F56D9",
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 40,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
                View My Bookings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BookProperty;
