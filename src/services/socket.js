import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../utiliti/config';

let socket;

export const initSocket = async (location) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.log('No token for socket connection');
      return;
    }

    const query = { token };
    if (location) {
      query.location = JSON.stringify(location);
    }

    // Connect to the server with the token
    socket = io(API_URL, {
      query,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  } catch (error) {
    console.error('Error initializing socket:', error);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// --- FIX 1: Update sendMessage to accept attachments ---
export const sendMessage = (recipientId, text, attachment = null) => {
  if (socket) {
    socket.emit('sendMessage', { recipientId, text, attachment });
  }
};

// --- FIX 2: Add Generic 'on' listener export ---
// This prevents the crash in MessageScreen useEffect
export const on = (event, handler) => {
  if (socket) {
    socket.on(event, handler);
  }
};

// --- FIX 3: Add Generic 'off' listener export ---
// This allows you to clean up listeners and prevent memory leaks
export const off = (event, handler) => {
  if (socket) {
    socket.off(event, handler);
  }
};

// --- FIX 4: Add Generic 'emit' export ---
// This fixes the crash when typing (socket.emit is not a function)
export const emit = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};

export const onReceiveMessage = (handler) => {
  if (socket) {
    socket.on('receiveMessage', handler);
  }
};

export const onUserStatusUpdate = (handler) => {
  if (socket) {
    socket.on('userStatus', handler);
  }
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

// export const sendMessage = (recipientId, text) => {
//   if (socket) {
//     socket.emit('sendMessage', { recipientId, text });
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
