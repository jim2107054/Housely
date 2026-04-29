import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  BackHandler,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { triggerBookingRefresh } from '../../services/socketService';

const SCREEN_STATES = {
  WEBVIEW: 'webview',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILURE: 'failure',
};

const PaymentWebView = () => {
  const router = useRouter();
  const { bookingId, amount, propertyName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [gatewayUrl, setGatewayUrl] = useState(null);
  const [screenState, setScreenState] = useState(SCREEN_STATES.WEBVIEW);

  useEffect(() => {
    initiatePayment();
  }, []);

  useEffect(() => {
    if (screenState === SCREEN_STATES.PROCESSING || screenState === SCREEN_STATES.SUCCESS) {
      const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => handler.remove();
    }
  }, [screenState]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setScreenState(SCREEN_STATES.WEBVIEW);

      const response = await api.post('/api/payments/initiate', {
        bookingId,
        amount: parseFloat(amount),
      });

      if (response.data && response.data.gatewayUrl) {
        const url = response.data.gatewayUrl;
        if (url === 'undefined' || !url.startsWith('http')) {
          throw new Error('Invalid gateway URL received: ' + url);
        }
        setGatewayUrl(url);
      } else {
        throw new Error('No gateway URL in response');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Could not initiate payment.';
      Alert.alert('Error', msg);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onNavigationStateChange = (navState) => {
    const url = navState.url || '';
    const isSuccess =
      url.includes('status=success') || url.includes('/sslcommerz/success');
    const isFailure =
      url.includes('status=fail') ||
      url.includes('status=cancel') ||
      url.includes('/sslcommerz/fail') ||
      url.includes('/sslcommerz/cancel');

    if (isSuccess) {
      setScreenState(SCREEN_STATES.PROCESSING);
      triggerBookingRefresh();
      setTimeout(() => {
        setScreenState(SCREEN_STATES.SUCCESS);
      }, 1000);
    } else if (isFailure) {
      setScreenState(SCREEN_STATES.PROCESSING);
      setTimeout(() => {
        setScreenState(SCREEN_STATES.FAILURE);
      }, 500);
    }
  };

  const formattedAmount = `৳${parseFloat(amount).toLocaleString('en-BD')}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={styles.loadingText}>Initializing payment gateway...</Text>
      </SafeAreaView>
    );
  }

  if (screenState === SCREEN_STATES.PROCESSING) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={styles.processingText}>Confirming your payment…</Text>
      </View>
    );
  }

  if (screenState === SCREEN_STATES.SUCCESS) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.centeredContent}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Booking Confirmed!</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Property</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {propertyName}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={[styles.detailValue, styles.amountValue]}>{formattedAmount}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>{bookingId}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)/myBooking')}
          >
            <Text style={styles.primaryButtonText}>View My Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screenState === SCREEN_STATES.FAILURE) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.centeredContent}>
          <Ionicons name="close-circle" size={80} color="#F44336" />
          <Text style={styles.failureTitle}>Payment Failed</Text>
          <Text style={styles.failureSubtitle}>
            Your payment could not be processed.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={initiatePayment}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Secure Checkout</Text>
          <Text style={styles.headerSubtitle}>Payment for {propertyName}</Text>
        </View>
        <Text style={styles.headerAmount}>৳{amount}</Text>
      </View>

      {gatewayUrl ? (
        <WebView
          source={{ uri: gatewayUrl }}
          onNavigationStateChange={onNavigationStateChange}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            Alert.alert(
              'Network Error',
              `Could not load payment page: ${nativeEvent.description || 'Unknown error'}\n\nCheck if the server at ${nativeEvent.url} is reachable.`,
              [{ text: 'Go Back', onPress: () => router.back() }]
            );
          }}
          renderLoading={() => (
            <View style={styles.webviewLoader}>
              <ActivityIndicator size="large" color="#7B61FF" />
            </View>
          )}
        />
      ) : (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7B61FF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#9E9E9E',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  successTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  failureTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  failureSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#EBEBEB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    color: '#7B61FF',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#7B61FF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#7B61FF',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#7B61FF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  headerAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7B61FF',
  },
  webviewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});

export default PaymentWebView;
