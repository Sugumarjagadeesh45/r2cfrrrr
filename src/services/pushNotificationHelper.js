import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../utiliti/config';

// Initialize modular messaging instance
const messaging = getMessaging(getApp());

// Function to get the FCM token and register it with the backend
export const getFCMToken = async () => {
  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        fcmToken = await messaging.getToken();
        await AsyncStorage.setItem('fcmToken', fcmToken);
        console.log('New FCM Token:', fcmToken);
      }
    }

    if (fcmToken) {
      await registerToken(fcmToken);
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Function to register the FCM token with the backend
export const registerToken = async (token) => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      return;
    }

    await fetch(`${API_URL}/api/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

// Function to set up notification listeners
export const setupNotificationListeners = (navigation) => {
  messaging.onTokenRefresh(async (newFcmToken) => {
    console.log('FCM Token refreshed:', newFcmToken);
    await AsyncStorage.setItem('fcmToken', newFcmToken);
    await registerToken(newFcmToken);
  });

  messaging.onMessage(async (remoteMessage) => {
    console.log('FCM Message received (foreground):');
    console.log('  Notification:', remoteMessage.notification);
    console.log('  Data:', remoteMessage.data);
    console.log('  Sent Time:', remoteMessage.sentTime);
  });

  messaging.onNotificationOpenedApp(async (remoteMessage) => {
    console.log('FCM Notification opened app (background/quit):');
    console.log('  Notification:', remoteMessage.notification);
    console.log('  Data:', remoteMessage.data);
    console.log('  Sent Time:', remoteMessage.sentTime);
    handleNotificationNavigation(remoteMessage.data, navigation);
  });

  messaging
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('FCM Initial notification (app launched from quit state):');
        console.log('  Notification:', remoteMessage.notification);
        console.log('  Data:', remoteMessage.data);
        console.log('  Sent Time:', remoteMessage.sentTime);
        handleNotificationNavigation(remoteMessage.data, navigation);
      }
    });
};

export const handleNotificationNavigation = (data, navigation) => {
  if (!data || !data.type) {
    return;
  }
  console.log('handleNotificationNavigation - Data received:', data);

  switch (data.type) {
    case 'chat_message': // Use 'chat_message' type as per messag_screen.md
      // MessageScreen now expects otherUserId, otherUserName, otherUserPhotoURL
      // If these are directly in data, pass them. Otherwise, map senderId to otherUserId.
      navigation.navigate('Chat', {
        screen: 'MessageScreen', // Assuming 'ChatScreen' maps to 'MessageScreen'
        params: {
          otherUserId: data.otherUserId || data.senderId, // Prioritize otherUserId, fallback to senderId
          user: { // Pass a partial user object if available, MessageScreen will fetch full if needed
            _id: data.otherUserId || data.senderId,
            name: data.otherUserName || 'Unknown User',
            photoURL: data.otherUserPhotoURL || 'https://randomuser.me/api/portraits/men/1.jpg', // Default avatar
            // isOnline: data.isOnline, // If backend sends this
          },
          // messageId: data.messageId, // No longer directly used by MessageScreen for fetching partner
        },
      });
      break;
    case 'FRIEND_REQUEST':
      navigation.navigate('Friends', {
        screen: 'FriendRequests',
        params: {
          senderId: data.senderId,
        },
      });
      break;
    case 'FRIEND_REQUEST_ACCEPTED':
      navigation.navigate('Friends', {
        screen: 'AllFriends',
        params: {
          acceptorId: data.acceptorId,
        },
      });
      break;
    case 'ADMIN_MESSAGE':
    case 'ADMIN_BROADCAST':
      navigation.navigate('Notifications', {
        screen: 'AdminNotifications',
      });
      break;
    default:
      break;
  }
};

// Background message handler must be outside the function, called once
messaging.setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('FCM Message handled in the background:');
  console.log('  Notification:', remoteMessage.notification);
  console.log('  Data:', remoteMessage.data);
  console.log('  Sent Time:', remoteMessage.sentTime);
});