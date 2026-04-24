import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

const Section = ({ title, children }) => (
  <View className="mb-6">
    <Text className="text-textPrimary font-poppins-bold text-base mb-3 border-b border-border pb-2">
      {title}
    </Text>
    {children}
  </View>
);

const Row = ({ label, value }) => (
  <View className="flex-row justify-between mb-2">
    <Text className="text-textSecondary font-poppins text-sm flex-1">{label}</Text>
    <Text className="text-textPrimary font-poppins-semibold text-sm flex-1 text-right" numberOfLines={2}>
      {value || "—"}
    </Text>
  </View>
);

const ContractView = () => {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/contracts/booking/${bookingId}`);
        setContract(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load contract");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  const handleShare = async () => {
    if (!contract?.content) return;
    const c = contract.content;
    const text =
      `HOUSELY DIGITAL AGREEMENT\n` +
      `Contract No: ${c.contractNumber}\n` +
      `Date: ${new Date(c.generatedAt).toLocaleDateString()}\n\n` +
      `PARTIES\n` +
      `Renter: ${c.parties?.renter?.name} (${c.parties?.renter?.email})\n` +
      `Owner:  ${c.parties?.owner?.name} (${c.parties?.owner?.email})\n\n` +
      `PROPERTY\n` +
      `${c.property?.name}, ${c.property?.address}, ${c.property?.city}\n\n` +
      `BOOKING\n` +
      `Check-in:  ${new Date(c.booking?.checkIn).toLocaleDateString()}\n` +
      `Check-out: ${new Date(c.booking?.checkOut).toLocaleDateString()}\n` +
      `Total:     BDT ${c.booking?.totalAmount?.toLocaleString()}\n\n` +
      `TERMS\n${c.terms?.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n` +
      `${c.legalNotice}`;

    await Share.share({ message: text, title: `Contract ${c.contractNumber}` });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6941C6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="document-text-outline" size={64} color="#DADADA" />
        <Text className="text-textSecondary font-poppins text-center mt-4">{error}</Text>
      </View>
    );
  }

  const c = contract?.content;
  if (!c) return null;

  const formattedDate = new Date(c.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color="#252B5C" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-poppins-bold text-textPrimary">
          Digital Contract
        </Text>
        <TouchableOpacity onPress={handleShare} className="w-10 h-10 items-center justify-center">
          <Ionicons name="share-outline" size={24} color="#6941C6" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 py-5" showsVerticalScrollIndicator={false}>
        {/* Title block */}
        <View className="items-center mb-6">
          <Text className="text-primary font-poppins-bold text-xl">HOUSELY</Text>
          <Text className="text-textPrimary font-poppins-bold text-base mt-1">
            DIGITAL RENTAL AGREEMENT
          </Text>
          <View className="mt-2 bg-green-100 px-4 py-1 rounded-full">
            <Text className="text-green-700 font-poppins text-xs">
              Contract No: {c.contractNumber}
            </Text>
          </View>
          <Text className="text-textSecondary font-poppins text-xs mt-1">
            Generated: {formattedDate}
          </Text>
        </View>

        <Section title="Parties">
          <Text className="text-textSecondary font-poppins-semibold text-xs mb-1 uppercase">Renter</Text>
          <Row label="Name" value={c.parties?.renter?.name} />
          <Row label="Email" value={c.parties?.renter?.email} />
          <Row label="Phone" value={c.parties?.renter?.phone} />
          <View className="h-3" />
          <Text className="text-textSecondary font-poppins-semibold text-xs mb-1 uppercase">Owner</Text>
          <Row label="Name" value={c.parties?.owner?.name} />
          <Row label="Email" value={c.parties?.owner?.email} />
          <Row label="Phone" value={c.parties?.owner?.phone} />
        </Section>

        <Section title="Property">
          <Row label="Name" value={c.property?.name} />
          <Row label="Address" value={c.property?.address} />
          <Row label="City" value={c.property?.city} />
          <Row label="Type" value={c.property?.listingType} />
          {c.property?.rentPerMonth && (
            <Row label="Monthly Rent" value={`BDT ${c.property.rentPerMonth.toLocaleString()}`} />
          )}
          {c.property?.salePrice && (
            <Row label="Sale Price" value={`BDT ${c.property.salePrice.toLocaleString()}`} />
          )}
        </Section>

        <Section title="Booking Details">
          <Row
            label="Check-in"
            value={new Date(c.booking?.checkIn).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          />
          <Row
            label="Check-out"
            value={new Date(c.booking?.checkOut).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          />
          <Row label="Total Amount" value={`BDT ${c.booking?.totalAmount?.toLocaleString()}`} />
          {c.booking?.notes && <Row label="Notes" value={c.booking.notes} />}
        </Section>

        <Section title="Terms & Conditions">
          {c.terms?.map((term, i) => (
            <View key={i} className="flex-row mb-3">
              <Text className="text-primary font-poppins-bold text-sm mr-2">{i + 1}.</Text>
              <Text className="text-textSecondary font-poppins text-sm flex-1">{term}</Text>
            </View>
          ))}
        </Section>

        <View className="bg-cardBackground rounded-xl p-4 mb-8">
          <Text className="text-textSecondary font-poppins text-xs leading-5">{c.legalNotice}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContractView;
