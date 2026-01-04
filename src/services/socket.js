import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../utiliti/config';

let socket = null;
let isConnecting = false;

export const initSocket = async (location) => {
  try {
    console.log('[Socket] initSocket called');
    if (socket && socket.connected) {
      console.log('[Socket] Already connected, reusing socket');
      return socket;
    }

    if (isConnecting) {
      console.log('[Socket] Already connecting, waiting...');
      return socket;
    }

    isConnecting = true;
    
    const token = await AsyncStorage.getItem('authToken');
    console.log('[Socket] Token exists:', !!token);
    
    if (!token) {
      console.log('[Socket] No token for socket connection');
      isConnecting = false;
      return;
    }

    const query = { token };
    if (location) {
      query.location = JSON.stringify(location);
    }

    console.log('[Socket] Connecting to:', API_URL);
    console.log('[Socket] Query params:', query);

    // Force new connection
    socket = io(API_URL, {
      query,
      transports: ['websocket', 'polling'], // Add both for fallback
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket event listeners with detailed logging
    socket.on('connect', () => {
      console.log('[Socket] ✅ Connected successfully!');
      console.log('[Socket] Socket ID:', socket.id);
      console.log('[Socket] Connected to server URL:', API_URL);
      isConnecting = false;
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] 🔴 Disconnected:', reason);
      console.log('[Socket] Was connected:', socket.connected);
      isConnecting = false;
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] ❌ Connection error:', error);
      console.error('[Socket] Error details:', error.message);
      isConnecting = false;
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket] 🔄 Reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket] 🔄 Reconnection attempt ${attemptNumber}`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[Socket] ❌ Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] ❌ Reconnection failed');
    });

    // Listen for custom events
    socket.on('receiveMessage', (data) => {
      console.log('[Socket] 📨 Received message event:', data);
    });

    socket.on('userStatus', (data) => {
      console.log('[Socket] 👤 User status update:', data);
    });

    socket.on('typingStatus', (data) => {
      console.log('[Socket] ✍️ Typing status:', data);
    });

    socket.on('messageStatusUpdate', (data) => {
      console.log('[Socket] ✅ Message status update:', data);
    });

    console.log('[Socket] Socket instance created, waiting for connection...');
    return socket;
  } catch (error) {
    console.error('[Socket] Error initializing socket:', error);
    isConnecting = false;
    throw error;
  }
};

export const getSocketStatus = () => {
  if (!socket) return 'not_initialized';
  return {
    connected: socket.connected,
    id: socket.id,
    disconnected: socket.disconnected
  };
};

export const disconnectSocket = () => {
  console.log('[Socket] Disconnecting socket');
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  isConnecting = false;
};

// Send message function with logging
export const sendMessage = (recipientId, text, attachment = null) => {
  if (!socket) {
    console.error('[Socket] ❌ Cannot send message: Socket not initialized');
    return false;
  }
  
  if (!socket.connected) {
    console.error('[Socket] ❌ Cannot send message: Socket not connected');
    return false;
  }
  
  console.log(`[Socket] 📤 Sending message to ${recipientId}:`, { 
    text, 
    hasAttachment: !!attachment,
    socketId: socket.id,
    socketConnected: socket.connected
  });
  
  socket.emit('sendMessage', { recipientId, text, attachment });
  return true;
};

// Generic event handlers with logging
export const on = (event, handler) => {
  console.log(`[Socket] 📡 Adding listener for event: ${event}`);
  if (socket) {
    socket.on(event, (...args) => {
      console.log(`[Socket] 📨 Event ${event} fired with data:`, args[0]);
      handler(...args);
    });
  } else {
    console.warn(`[Socket] ⚠️ Cannot add listener for ${event}: Socket not initialized`);
  }
};

export const off = (event, handler) => {
  console.log(`[Socket] 📡 Removing listener for event: ${event}`);
  if (socket) {
    socket.off(event, handler);
  }
};

export const emit = (event, data) => {
  console.log(`[Socket] 📤 Emitting event ${event}:`, data);
  if (socket) {
    if (!socket.connected) {
      console.error(`[Socket] ❌ Cannot emit ${event}: Socket not connected`);
      return false;
    }
    socket.emit(event, data);
    return true;
  } else {
    console.error(`[Socket] ❌ Cannot emit ${event}: Socket not initialized`);
    return false;
  }
};

export const onReceiveMessage = (handler) => {
  on('receiveMessage', handler);
};

export const offReceiveMessage = (handler) => {
  off('receiveMessage', handler);
};

export const onUserStatusUpdate = (handler) => {
  on('userStatus', handler);
};

// Add this to check socket connection periodically
export const checkConnection = () => {
  if (socket) {
    console.log('[Socket] Connection check:', {
      connected: socket.connected,
      id: socket.id,
      disconnected: socket.disconnected,
      io: {
        uri: socket.io?.uri,
        readyState: socket.io?.readyState
      }
    });
  } else {
    console.log('[Socket] Socket not initialized');
  }
  return socket?.connected || false;
};



// import io from 'socket.io-client';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_URL from '../utiliti/config';

// let socket;

// export const initSocket = async (location) => {
//   try {
//     const token = await AsyncStorage.getItem('authToken');
//     if (!token) {
//       console.log('No token for socket connection');
//       return;
//     }

//     const query = { token };
//     if (location) {
//       query.location = JSON.stringify(location);
//     }

//     // Connect to the server with the token
//     socket = io(API_URL, {
//       query,
//       transports: ['websocket'],
//     });

//     socket.on('connect', () => {
//       console.log('Socket connected successfully:', socket.id);
//     });

//     socket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
//     });

//     socket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//     });

//     return socket;
//   } catch (error) {
//     console.error('Error initializing socket:', error);
//   }
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//   }
// };

// // --- FIX 1: Update sendMessage to accept attachments ---
// export const sendMessage = (recipientId, text, attachment = null) => {
//   if (socket) {
//     socket.emit('sendMessage', { recipientId, text, attachment });
//   }
// };

// // --- FIX 2: Add Generic 'on' listener export ---
// // This prevents the crash in MessageScreen useEffect
// export const on = (event, handler) => {
//   if (socket) {
//     socket.on(event, handler);
//   }
// };

// // --- FIX 3: Add Generic 'off' listener export ---
// // This allows you to clean up listeners and prevent memory leaks
// export const off = (event, handler) => {
//   if (socket) {
//     socket.off(event, handler);
//   }
// };

// // --- FIX 4: Add Generic 'emit' export ---
// // This fixes the crash when typing (socket.emit is not a function)
// export const emit = (event, data) => {
//   if (socket) {
//     socket.emit(event, data);
//   }
// };

// export const onReceiveMessage = (handler) => {
//   if (socket) {
//     socket.on('receiveMessage', handler);
//   }
// };

// export const onUserStatusUpdate = (handler) => {
//   if (socket) {
//     socket.on('userStatus', handler);
//   }
// };

