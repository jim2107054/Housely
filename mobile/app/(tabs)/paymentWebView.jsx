import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const PaymentWebView = () => {
  const router = useRouter();
  const { bookingId, amount, propertyName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [gatewayUrl, setGatewayUrl] = useState(null);
  const [paymentFinished, setPaymentFinished] = useState(false);

  useEffect(() => {
    initiatePayment();
  }, []);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      console.log('[Payment] Initiating for booking:', bookingId, 'amount:', amount);
      
      const response = await api.post('/api/payments/initiate', {
        bookingId,
        amount: parseFloat(amount),
      });

      console.log('[Payment] Backend response:', response.data);

      if (response.data && response.data.gatewayUrl) {
        const url = response.data.gatewayUrl;
        if (url === "undefined" || !url.startsWith('http')) {
          throw new Error('Invalid gateway URL received: ' + url);
        }
        setGatewayUrl(url);
      } else {
        throw new Error('No gateway URL in response');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      const msg = error.response?.data?.message || error.message || 'Could not initiate payment.';
      Alert.alert('Error', msg);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onNavigationStateChange = (navState) => {
    // Detect redirect back to our app's deep link base
    // In a real app, this would be housely://payment?status=success...
    // But since WebView doesn't always handle deep links perfectly, 
    // we also look for our backend callback success page.
    
    if (navState.url.includes('status=success')) {
      setPaymentFinished(true);
      Alert.alert('Success', 'Payment completed successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/myBooking') }
      ]);
    } else if (navState.url.includes('status=fail') || navState.url.includes('status=cancel')) {
      setPaymentFinished(true);
      Alert.alert('Payment Failed', 'Your payment was not successful.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={{ marginTop: 12, color: '#9E9E9E' }}>Initializing payment gateway...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="close" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A' }}>Secure Checkout</Text>
          <Text style={{ fontSize: 12, color: '#9E9E9E' }}>Payment for {propertyName}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#7B61FF' }}>৳{amount}</Text>
      </View>

      {/* WebView */}
      {gatewayUrl && !paymentFinished ? (
        <WebView
          source={{ uri: gatewayUrl }}
          onNavigationStateChange={onNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            Alert.alert(
              'Network Error',
              `Could not load payment page: ${nativeEvent.description || 'Unknown error'}\n\nCheck if the server at ${nativeEvent.url} is reachable.`,
              [{ text: 'Go Back', onPress: () => router.back() }]
            );
          }}
          renderLoading={() => (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
              <ActivityIndicator size="large" color="#7B61FF" />
            </View>
          )}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7B61FF" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default PaymentWebView;
