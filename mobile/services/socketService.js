import { io } from 'socket.io-client';
import { API_URL } from '../config';

let socket = null;

// Clerk token provider — set from _layout.jsx after ClerkProvider mounts
let _getToken = null;
export const setSocketTokenProvider = (getToken) => {
  _getToken = getToken;
};

// Booking refresh callback — set by myBooking.jsx, called by Agent 10 after payment
let _bookingRefreshCallback = null;
export const setBookingRefreshCallback = (cb) => {
  _bookingRefreshCallback = cb;
};
export const triggerBookingRefresh = () => {
  if (_bookingRefreshCallback) _bookingRefreshCallback();
};

export const connectSocket = async () => {
  if (socket?.connected) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Allow a brief moment for Clerk's token to fully propagate after sign-in
  // before we try to use it for the socket handshake.
  let initialToken;
  try {
    initialToken = _getToken ? await _getToken() : null;
  } catch {
    console.warn('[Socket] Failed to get auth token — socket not connected');
    return null;
  }

  if (!initialToken) {
    console.warn('[Socket] No auth token available — socket not connected');
    return null;
  }

  socket = io(API_URL, {
    // Use a callback so a fresh token is fetched on every reconnection attempt
    auth: (cb) => {
      (_getToken ? _getToken() : Promise.resolve(null))
        .then((token) => cb({ token }))
        .catch(() => cb({ token: null }));
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 15000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
