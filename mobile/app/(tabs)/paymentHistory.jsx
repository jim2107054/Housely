import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import data (structured like backend API response)
import api from '../../services/api';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';



// Design Tokens
const COLORS = {
  primary: '#7B61FF',
  background: '#FFFFFF',
  screenBackground: '#F5F5F5',
  textPrimary: '#1A1A1A',
  textSecondary: '#9E9E9E',
  success: '#4CAF50',
  pending: '#FF9800',
  failed: '#F44336',
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'completed':
        return {
          bg: '#E8F5E9',
          text: '#4CAF50',
          label: 'Completed',
          icon: 'checkmark-circle',
        };
      case 'pending':
        return {
          bg: '#FFF3E0',
          text: '#FF9800',
          label: 'Pending',
          icon: 'time',
        };
      case 'failed':
        return {
          bg: '#FFEBEE',
          text: '#F44336',
          label: 'Failed',
          icon: 'close-circle',
        };
      default:
        return {
          bg: '#F0F0F0',
          text: '#9E9E9E',
          label: status,
          icon: 'help-circle',
        };
    }
  };

  const style = getStatusStyle();

  return (
    <View
      style={{
        backgroundColor: style.bg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
      }}
    >
      <Ionicons name={style.icon} size={14} color={style.text} />
      <Text
        style={{
          color: style.text,
          fontSize: 11,
          fontWeight: '600',
          marginLeft: 4,
        }}
      >
        {style.label}
      </Text>
    </View>
  );
};

// Payment Card Component
const PaymentCard = ({ payment, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Top Row with Property Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: payment.booking?.house?.images?.[0]?.url || 'https://via.placeholder.com/150' }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: COLORS.textPrimary,
            }}
            numberOfLines={1}
          >
            {payment.booking?.house?.name || "Unknown Property"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              marginTop: 2,
            }}
          >
            {new Date(payment.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <StatusBadge status={payment.status.toLowerCase()} />
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: '#F0F0F0',
          marginVertical: 12,
        }}
      />

      {/* Bottom Row with Amount and Details */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
            {payment.method || "Payment"}
          </Text>
          <Text style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>
            {payment.transactionId || payment.id}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: COLORS.primary,
          }}
        >
          ${payment.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Summary Card Component
const SummaryCard = ({ payments }) => {
  const totalPaid = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingAmount = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 12,
      }}
    >
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
        Total Payments
      </Text>
      <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>
        ${totalPaid.toLocaleString()}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
            Completed
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 2 }}>
            {payments.filter((p) => p.status === 'COMPLETED').length} transactions
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
            Pending
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 2 }}>
            ${pendingAmount.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const PaymentHistory = () => {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/users/me/payment-history');
        setPayments(response.data.payments || []);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments =
    filterStatus === 'all'
      ? payments
      : payments.filter((p) => p.status.toLowerCase() === filterStatus.toLowerCase());

  const FilterPill = ({ status, label }) => (
    <TouchableOpacity
      onPress={() => setFilterStatus(status)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: filterStatus === status ? COLORS.primary : '#F0F0F0',
        marginRight: 8,
      }}
    >
      <Text
        style={{
          color: filterStatus === status ? '#FFFFFF' : COLORS.textSecondary,
          fontSize: 13,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.screenBackground }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.background,
          position: 'relative',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            left: 16,
            padding: 8,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: COLORS.textPrimary,
          }}
        >
          Payment History
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <>
              <SummaryCard payments={payments} />
              
              {/* Filter Pills */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 16,
                  marginBottom: 8,
                }}
              >
                <FilterPill status="all" label="All" />
                <FilterPill status="completed" label="Completed" />
                <FilterPill status="pending" label="Pending" />
                <FilterPill status="failed" label="Failed" />
              </View>
            </>
          )}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              onPress={() => console.log('Payment details:', item.transactionId)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default PaymentHistory;
