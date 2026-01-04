import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GiftedChat, Bubble, InputToolbar, Send, Actions } from 'react-native-gifted-chat';
import { useRoute, useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './utiliti/config';
import * as socket from './services/socket';
import { launchImageLibrary } from 'react-native-image-picker';

const MessageScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = route.params; // The 'user' here is the other participant in the chat

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // New state for typing indicator
  const typingTimeoutRef = useRef(null);

  // Handle typing indicator
  const handleInputTextChanged = useCallback((text) => {
    if (text.length > 0) {
      socket.emit('typing', { recipientId: user._id });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { recipientId: user._id });
      }, 3000); // Stop typing after 3 seconds of inactivity
    } else {
      socket.emit('stopTyping', { recipientId: user._id });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [user._id]);

  useEffect(() => {
    const typingStatusHandler = ({ senderId, isTyping: status }) => {
      if (senderId === user._id) {
        setIsTyping(status);
      }
    };
    socket.on('typingStatus', typingStatusHandler);

    return () => {
      socket.off('typingStatus', typingStatusHandler); // Clean up listener
    };
  }, [user._id]);
  const [conversationMetadata, setConversationMetadata] = useState({
    isPinned: false,
    isBlocked: false,
    customRingtone: '',
    isFavorite: false,
  });

  // Handle attachment selection
  const handlePickAttachment = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed', // Can select both photos and videos
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // For now, just log and include in message as a placeholder
        console.log('Selected attachment:', asset);

        // Create a temporary message with attachment to display optimistically
        const tempId = Date.now().toString(); // More robust temporary ID
        const attachmentMessage = {
          _id: tempId,
          text: '', // No text, just attachment
          createdAt: new Date(),
          user: { _id: currentUser?._id },
          image: asset.uri, // Use image prop for GiftedChat to render image
          status: 'pending', // Optimistic status
          // For other types, GiftedChat might need custom rendering via renderMessage
          attachment: {
            type: asset.type === 'video' ? 'video' : 'image', // Determine type
            url: asset.uri,
            fileName: asset.fileName,
            fileSize: asset.fileSize,
            mimeType: asset.type,
          },
        };

        setMessages(previousMessages => GiftedChat.append(previousMessages, [attachmentMessage]));
        
        // Now send to backend via socket
        socket.sendMessage(user._id, '', { // Empty text, send attachment
          type: asset.type === 'video' ? 'video' : 'image',
          url: asset.uri, // In real app, this would be an uploaded URL
        });
      }
    } catch (error) {
      console.error('Error picking attachment:', error);
      Alert.alert('Error', 'Failed to pick attachment.');
    }
  }, [user._id, currentUser]);

  // Custom render actions for GiftedChat (attachment button)
  const renderActions = (props) => (
    <Actions
      {...props}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
        marginRight: 4,
        marginBottom: 0,
      }}
      icon={() => (
        <Icon name="attach-file" size={24} color={theme.textSecondary} />
      )}
      onPressActionButton={handlePickAttachment}
    />
  );

  // Fetch conversation metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/conversations/${user._id}/metadata`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.metadata) {
            setConversationMetadata(data.metadata);
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversation metadata:', error);
      }
    };
    fetchMetadata();
  }, [user._id]);

  // Update conversation metadata
  const updateMetadata = useCallback(async (updates) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/conversations/${user._id}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.metadata) {
          setConversationMetadata(data.metadata);
          Alert.alert('Success', 'Conversation settings updated.');
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update settings.');
      }
    } catch (error) {
      console.error('Error updating conversation metadata:', error);
      Alert.alert('Error', 'Network error or failed to update settings.');
    }
  }, [user._id]);

  const handleMoreMenuOption = (option) => {
    setMoreMenuVisible(false);
    switch (option) {
      case 'block':
        updateMetadata({ isBlocked: !conversationMetadata.isBlocked });
        break;
      case 'pin':
        updateMetadata({ isPinned: !conversationMetadata.isPinned });
        break;
      case 'favorite':
        updateMetadata({ isFavorite: !conversationMetadata.isFavorite });
        break;
      case 'customRingtone':
        Alert.alert('Custom Ringtone', 'Feature to select custom ringtone coming soon!');
        // Here you would navigate to a ringtone selection screen
        break;
      case 'clearChat':
        Alert.alert('Clear Chat', 'Feature to clear chat history coming soon!');
        break;
      case 'report':
        Alert.alert('Report User', 'Feature to report user coming soon!');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const initChat = async () => {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('Error', 'User information not found. Please login again.');
        navigation.goBack();
        return;
      }
      const userInfo = JSON.parse(userInfoStr);
      setCurrentUser(userInfo);
      
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/messages/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setMessages(data.data.map(msg => ({ // Backend response uses 'data' key for messages
            _id: msg._id,
            text: msg.text,
            createdAt: new Date(msg.createdAt),
            user: {
              _id: msg.sender._id, // Sender is an object in backend
              name: msg.sender.name,
              avatar: msg.sender.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
            },
            // Add message status
            status: msg.status, 
          })).reverse());
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        Alert.alert('Error', 'Failed to load messages.');
      } finally {
        setLoading(false);
      }
    };
    initChat();

    const messageHandler = (newMessage) => {
      const formattedMessage = {
        _id: newMessage._id,
        text: newMessage.text,
        createdAt: new Date(newMessage.createdAt),
        user: {
          _id: newMessage.sender._id,
          name: newMessage.sender.name,
          avatar: newMessage.sender.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        status: newMessage.status,
        attachment: newMessage.attachment,
      };

      setMessages(previousMessages => {
        // Check if this is an echo of a message sent by the current user
        // and if a 'pending' version of it exists.
        const isCurrentUserMessage = formattedMessage.user._id === currentUser?._id;
        const existingMessageIndex = previousMessages.findIndex(
          msg => isCurrentUserMessage && 
                 msg.status === 'pending' && 
                 msg.text === formattedMessage.text &&
                 // For attachments, we'll need to match attachment data
                 ((!msg.attachment && !formattedMessage.attachment) || 
                  (msg.attachment?.url === formattedMessage.attachment?.url)) &&
                 // Allow for slight time differences if createdAt is used for matching
                 Math.abs(new Date().getTime() - new Date(msg.createdAt).getTime()) < 5000 // 5 sec diff
        );

        if (existingMessageIndex > -1) {
          // Replace the pending message with the server-confirmed message
          const updatedMessages = [...previousMessages];
          updatedMessages[existingMessageIndex] = formattedMessage;
          return updatedMessages;
        } else {
          // If it's a new message (from other user) or no pending match, append it
          return GiftedChat.append(previousMessages, [formattedMessage]);
        }
      });
    };
    socket.onReceiveMessage(messageHandler);

    return () => {
      // socket.off('receiveMessage', messageHandler); // If socket.off is implemented
    };

  }, [user, currentUser]);

  const onSend = useCallback((newMessages = []) => {
    const msg = {
      ...newMessages[0],
      _id: Date.now().toString(), // Client-side temporary ID
      createdAt: new Date(),
      user: { _id: currentUser?._id },
      status: 'pending', // Optimistic status
    };

    setMessages(previousMessages => GiftedChat.append(previousMessages, [msg]));

    // Send the message to the backend. Include the temporary _id if the backend
    // is designed to echo it back, which facilitates matching.
    // Based on the backend docs, it doesn't seem to echo client_message_id,
    // so we'll rely on matching text/sender/timestamp for updates.
    socket.sendMessage(user._id, msg.text, msg.attachment);
  }, [user._id, currentUser]);

  // Render message status
  const renderMessageStatus = (props) => {
    const { currentMessage } = props;
    if (!currentMessage.user || currentMessage.user._id !== currentUser?._id) {
      return null; // Only show status for sent messages
    }
    let statusIcon;
    let statusColor = theme.textSecondary;

    switch (currentMessage.status) {
      case 'sent':
        statusIcon = 'done'; // Single checkmark
        statusColor = theme.textSecondary;
        break;
      case 'delivered':
        statusIcon = 'done-all'; // Double checkmark
        statusColor = theme.textSecondary;
        break;
      case 'read':
        statusIcon = 'done-all'; // Double checkmark
        statusColor = theme.accentColor; // Accent color for read
        break;
      default:
        statusIcon = 'schedule'; // Clock icon for pending
        statusColor = theme.textSecondary;
        break;
    }

    return (
      <View style={styles.messageStatusContainer}>
        {currentMessage.createdAt && (
          <Text style={styles.messageTime}>
            {new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
        {statusIcon && (
          <Icon name={statusIcon} size={14} color={statusColor} style={styles.statusIcon} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.headerBg} />
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: user.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.headerAvatar} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName}>{user.name}</Text>
          <Text style={styles.headerStatus}>{isTyping ? 'Typing...' : (user.isOnline ? 'Online' : 'Offline')}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="videocam" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="call" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMoreMenuVisible(true)} style={styles.headerIconBtn}>
            <Icon name="more-vert" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: currentUser?._id }}
        renderBubble={props => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: theme.accentColor },
              left: { backgroundColor: '#333' },
            }}
            textStyle={{
              right: { color: '#fff' },
              left: { color: '#fff' },
            }}
            renderCustomView={renderMessageStatus} // Render custom view for status
            timeTextStyle={{
              left: { display: 'none' }, // Hide default time as we render custom status
              right: { display: 'none' },
            }}
          />
        )}
        renderInputToolbar={props => (
          <InputToolbar 
            {...props} 
            containerStyle={styles.inputToolbar} 
            onInputTextChanged={handleInputTextChanged} // Add this prop
          />
        )}
        renderActions={renderActions} // Add this prop
        renderSend={props => (
          <Send {...props}>
            <View style={styles.sendButton}>
              <Icon name="send" size={24} color="#fff" />
            </View>
          </Send>
        )}
      />

      {/* More Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={moreMenuVisible}
        onRequestClose={() => setMoreMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMoreMenuVisible(false)}
        >
          <View style={styles.moreMenuContainer}>
            <View style={styles.moreMenuContent}>
              <Text style={styles.moreMenuTitle}>Conversation Options</Text>

              <TouchableOpacity style={styles.menuOption} onPress={() => handleMoreMenuOption('block')}>
                <Icon name={conversationMetadata.isBlocked ? 'check-box' : 'check-box-outline-blank'} size={24} color={theme.textPrimary} />
                <Text style={styles.menuOptionText}>{conversationMetadata.isBlocked ? 'Unblock User' : 'Block User'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOption} onPress={() => handleMoreMenuOption('pin')}>
                <Icon name={conversationMetadata.isPinned ? 'push-pin' : 'push-pin'} size={24} color={theme.textPrimary} />
                <Text style={styles.menuOptionText}>{conversationMetadata.isPinned ? 'Unpin Chat' : 'Pin Chat'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuOption} onPress={() => handleMoreMenuOption('favorite')}>
                <Icon name={conversationMetadata.isFavorite ? 'favorite' : 'favorite-border'} size={24} color={theme.textPrimary} />
                <Text style={styles.menuOptionText}>{conversationMetadata.isFavorite ? 'Unmark Favorite' : 'Mark Favorite'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOption} onPress={() => handleMoreMenuOption('customRingtone')}>
                <Icon name="music-note" size={24} color={theme.textPrimary} />
                <Text style={styles.menuOptionText}>Custom Ringtone</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuOption} onPress={() => handleMoreMenuOption('clearChat')}>
                <Icon name="delete" size={24} color={theme.textPrimary} />
                <Text style={styles.menuOptionText}>Clear Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuOption} onPress={() => handleMoreMenuOption('report')}>
                <Icon name="flag" size={24} color={theme.textPrimary} />
                <Text style={styles.menuOptionText}>Report User</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#141414' },
    chatHeader: {
      flexDirection: 'row', alignItems: 'center', padding: 10,
      backgroundColor: '#222', borderBottomWidth: 1, borderBottomColor: '#333'
    },
    backButton: { padding: 5, marginRight: 10 },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    headerTitleContainer: { flex: 1 },
    headerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    headerStatus: { color: '#888', fontSize: 12 },
    headerIcons: { flexDirection: 'row', gap: 20 },
    headerIconBtn: {
      padding: 5, // Make touchable area larger
    },
    inputToolbar: { backgroundColor: '#222', borderTopColor: '#333' },
    sendButton: { marginRight: 10, marginBottom: 5 },

    // More Options Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    moreMenuContainer: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40, // Increased for safe area
    },
    moreMenuContent: {
      width: '100%',
    },
    moreMenuTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 15,
      textAlign: 'center',
    },
    menuOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuOptionText: {
      fontSize: 16,
      color: theme.textPrimary,
      marginLeft: 15,
    },

    // Message Status Styles
    messageStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10, // Adjust as needed
      marginRight: 5,
      marginBottom: 2,
    },
    messageTime: {
      fontSize: 10,
      color: theme.textSecondary,
      marginRight: 5,
    },
    statusIcon: {
      // Styles for the status icon
    },
});

export default MessageScreen;
