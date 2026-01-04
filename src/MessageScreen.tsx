// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Image,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
//   TextInput,
//   FlatList,
//   Animated,
//   Dimensions,
//   Keyboard,
//   ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_URL from './utiliti/config';
// import * as socket from './services/socket';
// import * as userService from './services/userService'; // Import userService
// import { launchImageLibrary } from 'react-native-image-picker';

// const { width, height } = Dimensions.get('window');

// // Professional WhatsApp-inspired color palette
// const COLORS = {
//   primary: '#075E54',
//   primaryDark: '#054D44',
//   accent: '#128C7E',
//   green: '#25D366',
//   blue: '#34B7F1',
//   background: '#0D1418',
//   backgroundLight: '#131C21',
//   backgroundLighter: '#1F2C34',
//   cardDark: '#121E29',
//   textPrimary: '#E1E1E1',
//   textSecondary: '#A0A0A0',
//   textTertiary: '#6D7B85',
//   incomingBg: '#262D31',
//   outgoingBg: '#075E54',
//   border: '#242F32',
//   danger: '#F44336',
//   warning: '#FF9800',
// };

// const EMOJIS = [
//   ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
//   ['🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
//   ['😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'],
//   ['🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'],
//   ['😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'],
//   ['😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔'],
//   ['🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦'],
//   ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'],
//   ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞'],
//   ['🤟', '🤘', '👌', '🤏', '✊', '👊', '🤛', '🤜', '💪', '🦵'],
// ];

// const MessageScreen = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { user: initialUser, otherUserId: paramOtherUserId, senderId: paramSenderId } = route.params || {};

//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchingUser, setFetchingUser] = useState(true); // Separate state for user fetching
//   const [currentUser, setCurrentUser] = useState(null);
//   const [otherUser, setOtherUser] = useState(null);
//   const [moreMenuVisible, setMoreMenuVisible] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [inputText, setInputText] = useState('');
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const typingTimeoutRef = useRef(null);
//   const flatListRef = useRef(null);
//   const inputRef = useRef(null);

//   const [conversationMetadata, setConversationMetadata] = useState({
//     isPinned: false,
//     isBlocked: false,
//     customRingtone: '',
//     isFavorite: false,
//   });

//   const [lastSeen, setLastSeen] = useState('2:30 PM');

//   // Debug route params
//   useEffect(() => {
//     console.log('MessageScreen params:', route.params);
//   }, []);


  
//   // Effect to load otherUser data - SIMPLIFIED VERSION
// useEffect(() => {
//   const loadOtherUser = async () => {
//     try {
//       console.log('Loading other user...');
//       console.log('Params:', { initialUser, paramOtherUserId, paramSenderId });

//       // Try to get targetUserId from various sources
//       if (initialUser) {
//         console.log('Initial user object:', initialUser);
        
//         // Check if initialUser has either _id or id field
//         if (initialUser._id || initialUser.id) {
//           // Full user object already provided
//           console.log('Setting otherUser from initialUser');
          
//           // Standardize the user object - ensure it has both _id and id for consistency
//           const standardizedUser = {
//             ...initialUser,
//             _id: initialUser._id || initialUser.id, // Use _id if exists, otherwise use id
//             id: initialUser.id || initialUser._id,  // Use id if exists, otherwise use _id
//           };
          
//           console.log('Standardized user:', standardizedUser);
//           setOtherUser(standardizedUser);
//           setFetchingUser(false);
//           return;
//         }
//       }

//       let targetUserId = null;
      
//       // Check other parameters if initialUser didn't have the right structure
//       if (paramOtherUserId) {
//         targetUserId = paramOtherUserId;
//       } else if (paramSenderId) {
//         targetUserId = paramSenderId;
//       }

//       if (!targetUserId) {
//         console.error('No valid user ID found from any parameter');
//         Alert.alert('Chat Error', 'Unable to identify chat partner. Please try again.');
//         navigation.goBack();
//         return;
//       }

//       console.log('Fetching user with ID:', targetUserId);
      
//       const token = await AsyncStorage.getItem('authToken');
//       if (!token) {
//         Alert.alert('Authentication Error', 'Please login again.');
//         navigation.navigate('Login');
//         return;
//       }

//       const response = await fetch(`${API_URL}/api/user/profile/${targetUserId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success && data.data) {
//           console.log('User data fetched:', data.data);
//           setOtherUser(data.data);
//         } else {
//           Alert.alert('Error', 'User not found.');
//           navigation.goBack();
//         }
//       } else {
//         Alert.alert('Error', 'Failed to load user data.');
//         navigation.goBack();
//       }
//     } catch (error) {
//       console.error('Error loading other user:', error);
//       Alert.alert('Error', 'Failed to load chat.');
//       navigation.goBack();
//     } finally {
//       setFetchingUser(false);
//     }
//   };

//   loadOtherUser();
// }, [initialUser, paramOtherUserId, paramSenderId]);




//   // Load current user
//   useEffect(() => {
//     const loadCurrentUser = async () => {
//       try {
//         const userInfoStr = await AsyncStorage.getItem('userInfo');
//         if (userInfoStr) {
//           const userInfo = JSON.parse(userInfoStr);
//           setCurrentUser(userInfo);
//         }
//       } catch (error) {
//         console.error('Error loading current user:', error);
//       }
//     };

//     loadCurrentUser();
//   }, []);


  

//   // Load messages once otherUser is loaded
// useEffect(() => {
//   if (!otherUser || (!otherUser._id && !otherUser.id)) return;

//   const loadMessages = async () => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       const currentUserInfoStr = await AsyncStorage.getItem('userInfo');
//       const currentUserInfo = JSON.parse(currentUserInfoStr || '{}');
      
//       // Use the correct ID field
//       const otherUserId = otherUser._id || otherUser.id;
//       const currentUserId = currentUserInfo._id || currentUserInfo.id;

//       console.log(`Fetching messages between ${currentUserId} and ${otherUserId}`);

//       const response = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await response.json();
//       if (data.success && data.data) {
//         const formattedMessages = data.data.map(msg => ({
//           _id: msg._id,
//           text: msg.text,
//           createdAt: new Date(msg.createdAt),
//           user: {
//             _id: msg.sender._id || msg.sender.id, // Handle both _id and id
//             name: msg.sender.name,
//             avatar: msg.sender.avatar || msg.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//           },
//           status: msg.status,
//           attachment: msg.attachment,
//         }));

//         setMessages(formattedMessages.reverse());
//       }
//     } catch (error) {
//       console.error('Error loading messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadMessages();

//   // Setup socket listeners
//   const messageHandler = (newMessage) => {
//     console.log('New message received:', newMessage);
    
//     const formattedMessage = {
//       _id: newMessage._id,
//       text: newMessage.text,
//       createdAt: new Date(newMessage.createdAt),
//       user: {
//         _id: newMessage.sender._id || newMessage.sender.id, // Handle both _id and id
//         name: newMessage.sender.name,
//         avatar: newMessage.sender.avatar || newMessage.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//       },
//       status: newMessage.status,
//       attachment: newMessage.attachment,
//     };

//     setMessages(prev => {
//       // Remove any pending message with same content (optimistic updates)
//       const filtered = prev.filter(msg => 
//         !(msg.status === 'pending' && msg.text === formattedMessage.text)
//       );
//       return [...filtered, formattedMessage];
//     });
//   };

//   socket.onReceiveMessage(messageHandler);

//   return () => {
//     socket.offReceiveMessage(messageHandler);
//   };
// }, [otherUser]);




//   // Handle keyboard visibility
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       (e) => {
//         setKeyboardHeight(e.endCoordinates.height);
//         setIsKeyboardVisible(true);
//         setShowEmojiPicker(false);
//       }
//     );
    
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => {
//         setKeyboardHeight(0);
//         setIsKeyboardVisible(false);
//       }
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Handle typing indicator

//   // Handle typing indicator
// const handleInputTextChanged = useCallback((text) => {
//   setInputText(text);
//   const otherUserId = otherUser?._id || otherUser?.id;
  
//   if (otherUserId) {
//     if (text.length > 0) {
//       socket.emit('typing', { recipientId: otherUserId });
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit('stopTyping', { recipientId: otherUserId });
//       }, 3000);
//     } else {
//       socket.emit('stopTyping', { recipientId: otherUserId });
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     }
//   }
// }, [otherUser]);

// // Typing status listener
// useEffect(() => {
//   const otherUserId = otherUser?._id || otherUser?.id;
  
//   if (otherUserId) {
//     const typingStatusHandler = ({ senderId, isTyping: status }) => {
//       if (senderId === otherUserId) {
//         setIsTyping(status);
//       }
//     };
//     socket.on('typingStatus', typingStatusHandler);

//     return () => {
//       socket.off('typingStatus', typingStatusHandler);
//     };
//   }
// }, [otherUser]);

//   // Handle message sending


//   useEffect(() => {
//   if (otherUser) {
//     console.log('otherUser structure:', {
//       has_id: !!otherUser._id,
//       has_id_value: otherUser._id,
//       has_id_field: !!otherUser.id,
//       has_id_field_value: otherUser.id,
//       userObject: otherUser
//     });
//   }
// }, [otherUser]);

//   // Handle message sending
// const handleSend = () => {
//   // Use correct ID field
//   const otherUserId = otherUser._id || otherUser.id;
//   const currentUserId = currentUser?._id || currentUser?.id;
  
//   if (!otherUserId || !currentUserId || !inputText.trim()) return;

//   const tempId = Date.now().toString();
//   const newMessage = {
//     _id: tempId,
//     text: inputText.trim(),
//     createdAt: new Date(),
//     user: { _id: currentUserId },
//     status: 'pending',
//   };

//   // Add optimistic message
//   setMessages(prev => [...prev, newMessage]);
  
//   // Send via socket - use the correct ID
//   socket.sendMessage(otherUserId, inputText.trim());
  
//   // Clear input
//   setInputText('');
//   setShowEmojiPicker(false);
// };

//   // Loading state
//   if (fetchingUser || !otherUser) {
//     return (
//       <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//         <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
//         <ActivityIndicator size="large" color={COLORS.green} />
//         <Text style={{ color: COLORS.textPrimary, marginTop: 20 }}>Loading chat...</Text>
//       </SafeAreaView>
//     );
//   }

//   // Main render
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity 
//             onPress={() => navigation.goBack()} 
//             style={styles.backButton}
//           >
//             <Icon name="arrow-back" size={26} color={COLORS.textPrimary} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.userInfoContainer}>
//             <Image 
//               source={{ uri: otherUser.photoURL || otherUser.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
//               style={styles.avatar}
//             />
//             <View style={styles.userInfo}>
//               <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
//               <View style={styles.statusContainer}>
//                 {isTyping ? (
//                   <View style={styles.typingContainer}>
//                     <View style={styles.typingDot} />
//                     <View style={[styles.typingDot, styles.typingDotMiddle]} />
//                     <View style={styles.typingDot} />
//                     <Text style={styles.typingText}>Typing...</Text>
//                   </View>
//                 ) : (
//                   <Text style={styles.statusText}>Last seen {lastSeen}</Text>
//                 )}
//               </View>
//             </View>
//           </TouchableOpacity>
          
//           <View style={styles.headerActions}>
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')}
//             >
//               <Icon name="videocam" size={26} color={COLORS.textPrimary} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Voice Call', 'Voice call feature coming soon!')}
//             >
//               <Icon name="call" size={24} color={COLORS.textPrimary} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => setMoreMenuVisible(true)}
//             >
//               <Icon name="more-vert" size={26} color={COLORS.textPrimary} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Chat Messages */}
//       // In the FlatList renderItem
// <FlatList
//   ref={flatListRef}
//   data={messages}
//   renderItem={({ item }) => {
//     // Handle both _id and id fields
//     const messageUserId = item.user._id || item.user.id;
//     const currentUserId = currentUser?._id || currentUser?.id;
//     const isOutgoing = messageUserId === currentUserId;
    
//     return (
//       <View style={[
//         styles.messageItem,
//         isOutgoing ? styles.messageItemOutgoing : styles.messageItemIncoming
//       ]}>
//         <View style={[
//           styles.messageBubble,
//           isOutgoing ? styles.outgoingBubble : styles.incomingBubble
//         ]}>
//           <Text style={[
//             styles.messageText,
//             isOutgoing ? styles.outgoingMessageText : styles.incomingMessageText
//           ]}>
//             {item.text}
//           </Text>
//           <Text style={styles.messageTime}>
//             {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//           </Text>
//         </View>
//       </View>
//     );
//   }}
//   keyExtractor={(item) => item._id ? item._id.toString() : item.id ? item.id.toString() : Math.random().toString()}
//   contentContainerStyle={styles.messagesList}
//   inverted
//   showsVerticalScrollIndicator={false}
// />

//       {/* Input Area */}
//       <View style={[
//         styles.inputContainer,
//         { marginBottom: showEmojiPicker ? 0 : keyboardHeight }
//       ]}>
//         <View style={styles.inputWrapper}>
//           <TouchableOpacity 
//             style={styles.emojiButton}
//             onPress={() => setShowEmojiPicker(!showEmojiPicker)}
//           >
//             <Icon 
//               name={showEmojiPicker ? "keyboard" : "insert-emoticon"} 
//               size={28} 
//               color={showEmojiPicker ? COLORS.green : COLORS.textTertiary} 
//             />
//           </TouchableOpacity>

//           <TextInput
//             ref={inputRef}
//             style={styles.textInput}
//             value={inputText}
//             onChangeText={handleInputTextChanged}
//             placeholder="Type a message..."
//             placeholderTextColor={COLORS.textTertiary}
//             multiline
//           />

//           <TouchableOpacity 
//             style={[
//               styles.sendButton,
//               !inputText.trim() && styles.sendButtonDisabled
//             ]}
//             onPress={handleSend}
//             disabled={!inputText.trim()}
//           >
//             <Icon name="send" size={22} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };



// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//   },
//   loadingText: {
//     color: COLORS.textPrimary,
//     fontSize: 18,
//   },
//   header: {
//     backgroundColor: COLORS.primary,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.2)',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 5,
//     zIndex: 10,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     height: 60,
//   },
//   backButton: {
//     padding: 4,
//     marginRight: 12,
//   },
//   userInfoContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     marginRight: 12,
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     color: COLORS.textPrimary,
//     fontSize: 17,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   onlineContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   onlineDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.green,
//     marginRight: 6,
//   },
//   typingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   typingDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: COLORS.green,
//     marginHorizontal: 1,
//   },
//   typingDotMiddle: {
//     opacity: 0.7,
//   },
//   typingText: {
//     color: COLORS.green,
//     fontSize: 12,
//     marginLeft: 8,
//     fontStyle: 'italic',
//   },
//   statusText: {
//     color: COLORS.textSecondary,
//     fontSize: 13,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerActionButton: {
//     padding: 8,
//     marginLeft: 16,
//   },
//   messagesList: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     paddingBottom: 20,
//   },
//   messageItem: {
//     marginVertical: 4,
//     maxWidth: '80%',
//   },
//   messageItemOutgoing: {
//     alignSelf: 'flex-end',
//   },
//   messageItemIncoming: {
//     alignSelf: 'flex-start',
//   },
//   messageBubble: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   outgoingBubble: {
//     backgroundColor: COLORS.outgoingBg,
//     borderBottomRightRadius: 4,
//   },
//   incomingBubble: {
//     backgroundColor: COLORS.incomingBg,
//     borderBottomLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 15,
//     lineHeight: 20,
//   },
//   outgoingMessageText: {
//     color: '#FFFFFF',
//   },
//   incomingMessageText: {
//     color: COLORS.textPrimary,
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//   },
//   messageTimeText: {
//     fontSize: 11,
//     marginRight: 4,
//   },
//   statusIcon: {
//     marginLeft: 2,
//   },
//   attachmentIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     padding: 6,
//     backgroundColor: 'rgba(0,0,0,0.2)',
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   attachmentText: {
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   // Input Container Styles
//   inputContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     minHeight: 48,
//   },
//   emojiButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   textInputWrapper: {
//     flex: 1,
//     marginHorizontal: 8,
//     backgroundColor: COLORS.backgroundLighter,
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     maxHeight: 120,
//     minHeight: 44,
//     justifyContent: 'center',
//   },
//   textInput: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     paddingVertical: 10,
//     maxHeight: 100,
//     minHeight: 24,
//     textAlignVertical: 'center',
//   },
//   attachmentButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: COLORS.green,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   sendButtonDisabled: {
//     backgroundColor: COLORS.backgroundLighter,
//   },
//   emojiPickerContainer: {
//     height: 250,
//     backgroundColor: COLORS.backgroundLight,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     marginTop: 8,
//   },
//   emojiScrollView: {
//     flex: 1,
//     paddingHorizontal: 8,
//     paddingVertical: 12,
//   },
//   emojiRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   emojiItem: {
//     width: 36,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   emojiText: {
//     fontSize: 28,
//   },
//   messageStatusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//     marginRight: 8,
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   moreMenuContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 30,
//   },
//   moreMenuHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 10,
//     marginBottom: 15,
//   },
//   moreMenuContent: {
//     paddingHorizontal: 20,
//   },
//   moreMenuTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   menuOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   menuOptionText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     marginLeft: 15,
//   },
// });

// export default MessageScreen;

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './utiliti/config';
import * as socket from './services/socket';
import * as userService from './services/userService';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

// Professional color palette
const COLORS = {
  primary: '#0A5DFF',
  primaryDark: '#0047CC',
  accent: '#0A5DFF',
  secondary: '#6C63FF',
  success: '#00C896',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F8F9FA',
  backgroundLight: '#FFFFFF',
  backgroundLighter: '#F1F3F5',
  cardDark: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  incomingBg: '#E5E5EA',
  outgoingBg: '#0A5DFF',
  border: '#E5E5EA',
  shadow: 'rgba(0, 0, 0, 0.1)',
  online: '#34C759',
  typing: '#0A5DFF',
};

const EMOJIS = [
  ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
  ['🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  ['😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'],
  ['🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'],
  ['😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'],
  ['😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔'],
  ['🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦'],
  ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'],
  ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞'],
  ['🤟', '🤘', '👌', '🤏', '✊', '👊', '🤛', '🤜', '💪', '🦵'],
];

const MessageScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user: initialUser, otherUserId: paramOtherUserId, senderId: paramSenderId } = route.params || {};



  const [socketStatus, setSocketStatus] = useState('disconnected');



  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  const [conversationMetadata, setConversationMetadata] = useState({
    isPinned: false,
    isBlocked: false,
    customRingtone: '',
    isFavorite: false,
  });

  const [lastSeen, setLastSeen] = useState('2:30 PM');

  // Debug route params
  useEffect(() => {
    console.log('MessageScreen params:', route.params);
  }, []);


useEffect(() => {
  const interval = setInterval(() => {
    const status = socket.getSocketStatus();
    console.log('[MessageScreen] Socket status:', status);
    if (typeof status === 'object') {
      setSocketStatus(status.connected ? 'connected' : 'disconnected');
    } else {
      setSocketStatus(status);
    }
  }, 5000);

  return () => clearInterval(interval);
}, []);



// In MessageScreen.js, update the useEffect for socket
// Fix the useEffect for socket listeners
useEffect(() => {
  console.log('[MessageScreen] 🚀 Setting up socket listeners');
  
  let isMounted = true;
  let messageHandler = null;

  const initializeSocket = async () => {
    try {
      await socket.initSocket();
      
      if (!isMounted) return;
      
      messageHandler = (newMessage) => {
        if (!isMounted) return;
        
        console.log('\n[MessageScreen] 📨 RECEIVED MESSAGE');
        console.log('[MessageScreen] Message ID:', newMessage._id);
        console.log('[MessageScreen] From:', newMessage.sender?._id);
        
        const messageUserId = newMessage.sender._id || newMessage.sender.id;
        const otherUserId = otherUser?._id || otherUser?.id;
        
        // Ignore messages not from current chat partner
        if (messageUserId !== otherUserId) {
          console.log('[MessageScreen] ⚠️ Ignoring message from different user');
          return;
        }
        
        // Check if this is a duplicate (based on message ID)
        setMessages(prev => {
          const exists = prev.find(msg => msg._id === newMessage._id);
          if (exists) {
            console.log('[MessageScreen] ⚠️ Message already exists, ignoring');
            return prev;
          }
          
          const formattedMessage = {
            _id: newMessage._id,
            text: newMessage.text,
            createdAt: new Date(newMessage.createdAt),
            user: {
              _id: newMessage.sender._id,
              name: newMessage.sender.name,
              avatar: newMessage.sender.avatar || newMessage.sender.photoURL,
            },
            status: newMessage.status,
            attachment: newMessage.attachment,
          };
          
          console.log('[MessageScreen] ✅ Adding new message');
          return [...prev, formattedMessage];
        });
      };
      
      // Register handler
      socket.onReceiveMessage(messageHandler);
      
      // Add status update listener
      const statusHandler = (updatedMessage) => {
        console.log('[MessageScreen] 📊 Status update:', updatedMessage._id);
        setMessages(prev =>
          prev.map(msg =>
            msg._id === updatedMessage._id ? { 
              ...msg, 
              status: updatedMessage.status,
              ...(updatedMessage.deliveredAt && { deliveredAt: updatedMessage.deliveredAt }),
              ...(updatedMessage.readAt && { readAt: updatedMessage.readAt })
            } : msg
          )
        );
      };
      
      socket.on('messageStatusUpdate', statusHandler);
      
    } catch (error) {
      console.error('[MessageScreen] ❌ Socket init error:', error);
    }
  };

  initializeSocket();

  // Cleanup function
  return () => {
    console.log('[MessageScreen] 🧹 Cleaning up socket listeners');
    isMounted = false;
    if (messageHandler) {
      socket.offReceiveMessage(messageHandler);
    }
  };
}, [otherUser?._id]); // Only depend on otherUser._id, not the entire object




  // Effect to load otherUser data
  useEffect(() => {
    const loadOtherUser = async () => {
      try {
        console.log('Loading other user...');
        console.log('Params:', { initialUser, paramOtherUserId, paramSenderId });

        if (initialUser) {
          console.log('Initial user object:', initialUser);
          
          if (initialUser._id || initialUser.id) {
            console.log('Setting otherUser from initialUser');
            
            const standardizedUser = {
              ...initialUser,
              _id: initialUser._id || initialUser.id,
              id: initialUser.id || initialUser._id,
              // Add professional title if not present
              profession: initialUser.profession || initialUser.job || 'Software Developer',
            };
            
            console.log('Standardized user:', standardizedUser);
            setOtherUser(standardizedUser);
            setFetchingUser(false);
            return;
          }
        }

        let targetUserId = null;
        
        if (paramOtherUserId) {
          targetUserId = paramOtherUserId;
        } else if (paramSenderId) {
          targetUserId = paramSenderId;
        }

        if (!targetUserId) {
          console.error('No valid user ID found from any parameter');
          Alert.alert('Chat Error', 'Unable to identify chat partner. Please try again.');
          navigation.goBack();
          return;
        }

        console.log('Fetching user with ID:', targetUserId);
        
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Authentication Error', 'Please login again.');
          navigation.navigate('Login');
          return;
        }

        const response = await fetch(`${API_URL}/api/user/profile/${targetUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            console.log('User data fetched:', data.data);
            // Add profession if not present
            const userData = {
              ...data.data,
              profession: data.data.profession || data.data.job || 'Software Developer',
            };
            setOtherUser(userData);
          } else {
            Alert.alert('Error', 'User not found.');
            navigation.goBack();
          }
        } else {
          Alert.alert('Error', 'Failed to load user data.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading other user:', error);
        Alert.alert('Error', 'Failed to load chat.');
        navigation.goBack();
      } finally {
        setFetchingUser(false);
      }
    };

    loadOtherUser();
  }, [initialUser, paramOtherUserId, paramSenderId]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          setCurrentUser(userInfo);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadCurrentUser();
  }, []);

  // Load messages once otherUser is loaded
  useEffect(() => {
    if (!otherUser || (!otherUser._id && !otherUser.id)) return;

    const loadMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const currentUserInfoStr = await AsyncStorage.getItem('userInfo');
        const currentUserInfo = JSON.parse(currentUserInfoStr || '{}');
        
        const otherUserId = otherUser._id || otherUser.id;
        const currentUserId = currentUserInfo._id || currentUserInfo.id;

        console.log(`Fetching messages between ${currentUserId} and ${otherUserId}`);

        const response = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success && data.data) {
          const formattedMessages = data.data.map(msg => ({
            _id: msg._id,
            text: msg.text,
            createdAt: new Date(msg.createdAt),
            user: {
              _id: msg.sender._id || msg.sender.id,
              name: msg.sender.name,
              avatar: msg.sender.avatar || msg.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
            },
            status: msg.status,
            attachment: msg.attachment,
          }));

          setMessages(formattedMessages.reverse());
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Setup socket listeners
    const messageHandler = (newMessage) => {
      console.log('New message received:', newMessage);
      
      const formattedMessage = {
        _id: newMessage._id,
        text: newMessage.text,
        createdAt: new Date(newMessage.createdAt),
        user: {
          _id: newMessage.sender._id || newMessage.sender.id,
          name: newMessage.sender.name,
          avatar: newMessage.sender.avatar || newMessage.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        status: newMessage.status,
        attachment: newMessage.attachment,
      };

      setMessages(prev => {
        const filtered = prev.filter(msg => 
          !(msg.status === 'pending' && msg.text === formattedMessage.text)
        );
        return [...filtered, formattedMessage];
      });
    };

    socket.onReceiveMessage(messageHandler);

    return () => {
      socket.offReceiveMessage(messageHandler);
    };
  }, [otherUser]);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
        setShowEmojiPicker(false);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle typing indicator
  const handleInputTextChanged = useCallback((text) => {
    setInputText(text);
    const otherUserId = otherUser?._id || otherUser?.id;
    
    if (otherUserId) {
      if (text.length > 0) {
        socket.emit('typing', { recipientId: otherUserId });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('stopTyping', { recipientId: otherUserId });
        }, 3000);
      } else {
        socket.emit('stopTyping', { recipientId: otherUserId });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  }, [otherUser]);

  // Typing status listener
  useEffect(() => {
    const otherUserId = otherUser?._id || otherUser?.id;
    
    if (otherUserId) {
      const typingStatusHandler = ({ senderId, isTyping: status }) => {
        if (senderId === otherUserId) {
          setIsTyping(status);
        }
      };
      socket.on('typingStatus', typingStatusHandler);

      return () => {
        socket.off('typingStatus', typingStatusHandler);
      };
    }
  }, [otherUser]);



  const handleSend = () => {
  const otherUserId = otherUser._id || otherUser.id;
  const currentUserId = currentUser?._id || currentUser?.id;
  
  if (!otherUserId || !currentUserId || (!inputText.trim() && !selectedAttachment)) {
    return;
  }

  // Generate a temporary ID for optimistic update
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newMessage = {
    _id: tempId,
    text: inputText.trim() || '',
    createdAt: new Date(),
    user: { 
      _id: currentUserId,
      name: currentUser?.name || 'You'
    },
    status: 'pending',
    attachment: selectedAttachment,
  };

  console.log('[MessageScreen] Adding optimistic message with temp ID:', tempId);
  setMessages(prev => [...prev, newMessage]);
  
  // Send via socket
  const success = socket.sendMessage(otherUserId, inputText.trim(), selectedAttachment);
  
  if (success) {
    console.log('[MessageScreen] ✅ Message sent via socket');
  } else {
    console.error('[MessageScreen] ❌ Socket send failed');
    // Update status to failed
    setMessages(prev =>
      prev.map(msg =>
        msg._id === tempId ? { ...msg, status: 'failed' } : msg
      )
    );
  }
  
  setInputText('');
  setSelectedAttachment(null);
  setShowEmojiPicker(false);
};

// HTTP fallback function
const sendViaHttpApi = async (recipientId, text, attachment) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientId,
        text,
        attachment
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[MessageScreen] HTTP API send success:', data);
    } else {
      console.error('[MessageScreen] HTTP API send failed:', response.status);
    }
  } catch (error) {
    console.error('[MessageScreen] HTTP API send error:', error);
  }
};

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  // Handle attachment selection
  const handleAttachment = () => {
    setAttachmentModalVisible(true);
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };
    
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedAttachment({
          type: 'image',
          uri: response.assets[0].uri,
          name: response.assets[0].fileName,
        });
        setAttachmentModalVisible(false);
      }
    });
  };

  const selectCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };
    
    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedAttachment({
          type: 'image',
          uri: response.assets[0].uri,
          name: response.assets[0].fileName,
        });
        setAttachmentModalVisible(false);
      }
    });
  };

  // Loading state
  if (fetchingUser || !otherUser) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textPrimary, marginTop: 20 }}>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: otherUser.photoURL || otherUser.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                style={styles.avatar}
              />
              {otherUser.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
              <Text style={styles.userProfession}>{otherUser.profession || 'Software Developer'}</Text>
              <View style={styles.statusContainer}>
                {isTyping ? (
                  <View style={styles.typingContainer}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, styles.typingDotMiddle]} />
                    <View style={styles.typingDot} />
                    <Text style={styles.typingText}>Typing...</Text>
                  </View>
                ) : (
                  <Text style={styles.statusText}>
                    {otherUser.isOnline ? 'Online' : `Last seen ${lastSeen}`}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')}
            >
              <Icon name="videocam" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => Alert.alert('Voice Call', 'Voice call feature coming soon!')}
            >
              <Icon name="call" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => setMoreMenuVisible(true)}
            >
              <Icon name="more-vert" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => {
          const messageUserId = item.user._id || item.user.id;
          const currentUserId = currentUser?._id || currentUser?.id;
          const isOutgoing = messageUserId === currentUserId;
          
          return (
            <View style={[
              styles.messageItem,
              isOutgoing ? styles.messageItemOutgoing : styles.messageItemIncoming
            ]}>
              <View style={[
                styles.messageBubble,
                isOutgoing ? styles.outgoingBubble : styles.incomingBubble
              ]}>
                {item.attachment && (
                  <View style={styles.attachmentContainer}>
                    {item.attachment.type === 'image' ? (
                      <Image 
                        source={{ uri: item.attachment.uri }} 
                        style={styles.attachmentImage}
                      />
                    ) : (
                      <View style={styles.documentContainer}>
                        <Icon name="insert-drive-file" size={24} color={COLORS.textSecondary} />
                        <Text style={styles.documentName}>{item.attachment.name}</Text>
                      </View>
                    )}
                  </View>
                )}
                {item.text && (
                  <Text style={[
                    styles.messageText,
                    isOutgoing ? styles.outgoingMessageText : styles.incomingMessageText
                  ]}>
                    {item.text}
                  </Text>
                )}
                <View style={styles.messageTimeContainer}>
                  <Text style={[
                    styles.messageTime,
                    isOutgoing ? styles.outgoingMessageTime : styles.incomingMessageTime
                  ]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isOutgoing && (
                    <Icon 
                      name={item.status === 'read' ? "done-all" : "done"} 
                      size={16} 
                      color={item.status === 'read' ? COLORS.success : COLORS.textTertiary} 
                      style={styles.statusIcon}
                    />
                  )}
                </View>
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item._id ? item._id.toString() : item.id ? item.id.toString() : Math.random().toString()}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />

      {/* Attachment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={attachmentModalVisible}
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setAttachmentModalVisible(false)}
        >
          <View style={styles.attachmentModalContainer}>
            <View style={styles.attachmentModalHandle} />
            <Text style={styles.attachmentModalTitle}>Share</Text>
            
            <View style={styles.attachmentOptions}>
              <TouchableOpacity style={styles.attachmentOption} onPress={selectCamera}>
                <View style={styles.attachmentIconContainer}>
                  <Icon name="photo-camera" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.attachmentOptionText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentOption} onPress={selectImage}>
                <View style={styles.attachmentIconContainer}>
                  <Icon name="image" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.attachmentOptionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setAttachmentModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.emojiScrollView}
          >
            {EMOJIS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.emojiRow}>
                {row.map((emoji, emojiIndex) => (
                  <TouchableOpacity
                    key={emojiIndex}
                    style={styles.emojiItem}
                    onPress={() => handleEmojiSelect(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Attachment Preview */}
      {selectedAttachment && (
        <View style={styles.selectedAttachmentContainer}>
          {selectedAttachment.type === 'image' ? (
            <View style={styles.selectedImageContainer}>
              <Image 
                source={{ uri: selectedAttachment.uri }} 
                style={styles.selectedImage}
              />
              <TouchableOpacity 
                style={styles.removeAttachmentButton}
                onPress={() => setSelectedAttachment(null)}
              >
                <Icon name="close" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectedDocumentContainer}>
              <Icon name="insert-drive-file" size={24} color={COLORS.textSecondary} />
              <Text style={styles.selectedDocumentName} numberOfLines={1}>{selectedAttachment.name}</Text>
              <TouchableOpacity 
                style={styles.removeAttachmentButton}
                onPress={() => setSelectedAttachment(null)}
              >
                <Icon name="close" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Input Area */}
      <View style={[
        styles.inputContainer,
        { marginBottom: showEmojiPicker ? 0 : keyboardHeight }
      ]}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity 
            style={styles.emojiButton}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Icon 
              name={showEmojiPicker ? "keyboard" : "insert-emoticon"} 
              size={24} 
              color={showEmojiPicker ? COLORS.primary : COLORS.textTertiary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={handleAttachment}
          >
            <Icon name="attach-file" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={handleInputTextChanged}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() && !selectedAttachment) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() && !selectedAttachment}
          >
            <Icon name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

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
            <View style={styles.moreMenuHandle} />
            <Text style={styles.moreMenuTitle}>More Options</Text>
            
            <View style={styles.moreMenuContent}>
              <TouchableOpacity style={styles.menuOption}>
                <Icon name="info" size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuOptionText}>View Contact</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuOption}>
                <Icon name="search" size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuOptionText}>Search</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuOption}>
                <Icon name="volume-off" size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuOptionText}>Mute Notifications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuOption}>
                <Icon name="wallpaper" size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuOptionText}>Wallpaper</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuOption}>
                <Icon name="lock" size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuOptionText}>Encryption</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
                <Icon name="block" size={24} color={COLORS.danger} />
                <Text style={[styles.menuOptionText, styles.dangerText]}>Block</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
                <Icon name="delete" size={24} color={COLORS.danger} />
                <Text style={[styles.menuOptionText, styles.dangerText]}>Delete Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 70,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  userProfession: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.typing,
    marginHorizontal: 1,
  },
  typingDotMiddle: {
    opacity: 0.7,
  },
  typingText: {
    color: COLORS.typing,
    fontSize: 12,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 10,
  },
  messageItem: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageItemOutgoing: {
    alignSelf: 'flex-end',
  },
  messageItemIncoming: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  outgoingBubble: {
    backgroundColor: COLORS.outgoingBg,
    borderBottomRightRadius: 4,
  },
  incomingBubble: {
    backgroundColor: COLORS.incomingBg,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  outgoingMessageText: {
    color: COLORS.backgroundLight,
  },
  incomingMessageText: {
    color: COLORS.textPrimary,
  },
  messageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  outgoingMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  incomingMessageTime: {
    color: COLORS.textTertiary,
  },
  statusIcon: {
    marginLeft: 4,
  },
  attachmentContainer: {
    marginBottom: 8,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  inputContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 50,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    transform: [{ rotate: '-45deg' }],
  },
  textInputContainer: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: COLORS.backgroundLighter,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    minHeight: 40,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 6,
    maxHeight: 100,
    minHeight: 24,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundLighter,
  },
  emojiPickerContainer: {
    height: 250,
    backgroundColor: COLORS.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emojiScrollView: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emojiItem: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  selectedAttachmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  selectedImageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  selectedDocumentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.backgroundLighter,
    borderRadius: 8,
  },
  selectedDocumentName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  removeAttachmentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  attachmentModalContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  attachmentModalHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.textTertiary,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  attachmentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  attachmentOption: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  attachmentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 18,
    color: COLORS.danger,
    fontWeight: '500',
  },
  moreMenuContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  moreMenuHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.textTertiary,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  moreMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  moreMenuContent: {
    paddingHorizontal: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 15,
  },
  dangerOption: {
    // No additional styles needed
  },
  dangerText: {
    color: COLORS.danger,
  },
});

export default MessageScreen;
























// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Image,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   Platform,
//   KeyboardAvoidingView,
//   FlatList,
//   Animated,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { GiftedChat, Bubble, InputToolbar, Send, Actions, MessageText } from 'react-native-gifted-chat';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_URL from './utiliti/config';
// import * as socket from './services/socket';
// import { launchImageLibrary } from 'react-native-image-picker';
// import EmojiSelector from 'react-native-emoji-selector';

// const { width, height } = Dimensions.get('window');

// // Professional color palette
// const COLORS = {
//   primary: '#075E54', // WhatsApp-like primary
//   primaryDark: '#054D44',
//   accent: '#128C7E',
//   lightGreen: '#25D366',
//   blue: '#34B7F1',
//   background: '#0C151B',
//   cardDark: '#121E29',
//   cardLight: '#1A2A37',
//   textPrimary: '#FFFFFF',
//   textSecondary: '#8899A6',
//   textTertiary: '#647380',
//   incomingBg: '#1E2A35',
//   outgoingBg: '#075E54',
//   border: '#2D3E4D',
//   danger: '#F44336',
//   warning: '#FF9800',
// };

// const MessageScreen = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { user } = route.params;

//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [moreMenuVisible, setMoreMenuVisible] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const typingTimeoutRef = useRef(null);
//   const flatListRef = useRef(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const [conversationMetadata, setConversationMetadata] = useState({
//     isPinned: false,
//     isBlocked: false,
//     customRingtone: '',
//     isFavorite: false,
//   });

//   // Sample last seen time (you would get this from your backend)
//   const [lastSeen, setLastSeen] = useState('2:30 PM');

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   // Handle typing indicator
//   const handleInputTextChanged = useCallback((text) => {
//     if (text.length > 0) {
//       socket.emit('typing', { recipientId: user._id });
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit('stopTyping', { recipientId: user._id });
//       }, 3000);
//     } else {
//       socket.emit('stopTyping', { recipientId: user._id });
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     }
//   }, [user._id]);

//   useEffect(() => {
//     const typingStatusHandler = ({ senderId, isTyping: status }) => {
//       if (senderId === user._id) {
//         setIsTyping(status);
//       }
//     };
//     socket.on('typingStatus', typingStatusHandler);

//     return () => {
//       socket.off('typingStatus', typingStatusHandler);
//     };
//   }, [user._id]);

//   // Handle attachment selection
//   const handlePickAttachment = useCallback(async () => {
//     try {
//       const result = await launchImageLibrary({
//         mediaType: 'mixed',
//         quality: 0.8,
//         selectionLimit: 1,
//       });

//       if (result.assets && result.assets.length > 0) {
//         const asset = result.assets[0];
//         const tempId = Date.now().toString();
        
//         const attachmentMessage = {
//           _id: tempId,
//           text: asset.type?.startsWith('video') ? '🎥 Video' : '📷 Photo',
//           createdAt: new Date(),
//           user: { _id: currentUser?._id },
//           image: asset.uri,
//           status: 'pending',
//           attachment: {
//             type: asset.type?.startsWith('video') ? 'video' : 'image',
//             url: asset.uri,
//             fileName: asset.fileName,
//           },
//         };

//         setMessages(previousMessages => GiftedChat.append(previousMessages, [attachmentMessage]));
        
//         socket.sendMessage(user._id, '', {
//           type: asset.type?.startsWith('video') ? 'video' : 'image',
//           url: asset.uri,
//         });
//       }
//     } catch (error) {
//       console.error('Error picking attachment:', error);
//       Alert.alert('Error', 'Failed to pick attachment.');
//     }
//   }, [user._id, currentUser]);

//   // Handle emoji selection
//   const handleEmojiSelect = useCallback((emoji) => {
//     setShowEmojiPicker(false);
//     // You would typically add the emoji to your input text
//     // This depends on how you manage your input state
//   }, []);

//   // Fetch conversation metadata
//   useEffect(() => {
//     const fetchMetadata = async () => {
//       try {
//         const token = await AsyncStorage.getItem('authToken');
//         const response = await fetch(`${API_URL}/api/conversations/${user._id}/metadata`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           if (data.success && data.metadata) {
//             setConversationMetadata(data.metadata);
//           }
//         }
//       } catch (error) {
//         console.error('Failed to fetch conversation metadata:', error);
//       }
//     };
//     fetchMetadata();
//   }, [user._id]);

//   // Update conversation metadata
//   const updateMetadata = useCallback(async (updates) => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       const response = await fetch(`${API_URL}/api/conversations/${user._id}/metadata`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(updates),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success && data.metadata) {
//           setConversationMetadata(data.metadata);
//           Alert.alert('Success', 'Conversation settings updated.');
//         }
//       } else {
//         const errorData = await response.json();
//         Alert.alert('Error', errorData.message || 'Failed to update settings.');
//       }
//     } catch (error) {
//       console.error('Error updating conversation metadata:', error);
//       Alert.alert('Error', 'Network error or failed to update settings.');
//     }
//   }, [user._id]);

//   const handleMoreMenuOption = (option) => {
//     setMoreMenuVisible(false);
//     switch (option) {
//       case 'block':
//         updateMetadata({ isBlocked: !conversationMetadata.isBlocked });
//         break;
//       case 'pin':
//         updateMetadata({ isPinned: !conversationMetadata.isPinned });
//         break;
//       case 'favorite':
//         updateMetadata({ isFavorite: !conversationMetadata.isFavorite });
//         break;
//       case 'customRingtone':
//         Alert.alert('Custom Ringtone', 'Feature to select custom ringtone coming soon!');
//         break;
//       case 'clearChat':
//         Alert.alert('Clear Chat', 'Are you sure you want to clear all messages?', [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Clear', style: 'destructive', onPress: () => setMessages([]) },
//         ]);
//         break;
//       case 'report':
//         Alert.alert('Report User', 'Feature to report user coming soon!');
//         break;
//       default:
//         break;
//     }
//   };

//   useEffect(() => {
//     const statusUpdateHandler = (updatedMessage) => {
//       setMessages(previousMessages =>
//         previousMessages.map(msg =>
//           msg._id === updatedMessage._id ? { ...msg, status: updatedMessage.status } : msg
//         )
//       );
//     };

//     socket.on('messageStatusUpdate', statusUpdateHandler);

//     return () => {
//       socket.off('messageStatusUpdate', statusUpdateHandler);
//     };
//   }, []);

//   useEffect(() => {
//     const initChat = async () => {
//       const userInfoStr = await AsyncStorage.getItem('userInfo');
//       if (!userInfoStr) {
//         Alert.alert('Error', 'User information not found. Please login again.');
//         navigation.goBack();
//         return;
//       }
//       const userInfo = JSON.parse(userInfoStr);
//       setCurrentUser(userInfo);
      
//       try {
//         const token = await AsyncStorage.getItem('authToken');
//         const response = await fetch(`${API_URL}/api/messages/${user._id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (data.success) {
//           setMessages(data.data.map(msg => ({
//             _id: msg._id,
//             text: msg.text,
//             createdAt: new Date(msg.createdAt),
//             user: {
//               _id: msg.sender._id,
//               name: msg.sender.name,
//               avatar: msg.sender.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
//             },
//             status: msg.status,
//           })).reverse());
//         }
//       } catch (error) {
//         console.error('Failed to load messages:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     initChat();

//     const messageHandler = (newMessage) => {
//       const formattedMessage = {
//         _id: newMessage._id,
//         text: newMessage.text,
//         createdAt: new Date(newMessage.createdAt),
//         user: {
//           _id: newMessage.sender._id,
//           name: newMessage.sender.name,
//           avatar: newMessage.sender.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
//         },
//         status: newMessage.status,
//         attachment: newMessage.attachment,
//       };

//       setMessages(previousMessages => {
//         const isCurrentUserMessage = formattedMessage.user._id === currentUser?._id;
//         const existingMessageIndex = previousMessages.findIndex(
//           msg => isCurrentUserMessage && 
//                  msg.status === 'pending' && 
//                  msg.text === formattedMessage.text &&
//                  Math.abs(new Date().getTime() - new Date(msg.createdAt).getTime()) < 5000
//         );

//         if (existingMessageIndex > -1) {
//           const updatedMessages = [...previousMessages];
//           updatedMessages[existingMessageIndex] = formattedMessage;
//           return updatedMessages;
//         } else {
//           return GiftedChat.append(previousMessages, [formattedMessage]);
//         }
//       });
//     };
//     socket.onReceiveMessage(messageHandler);

//     return () => {
//       // Cleanup
//     };
//   }, [user, currentUser]);

//   const onSend = useCallback((newMessages = []) => {
//     const msg = {
//       ...newMessages[0],
//       _id: Date.now().toString(),
//       createdAt: new Date(),
//       user: { _id: currentUser?._id },
//       status: 'pending',
//     };

//     setMessages(previousMessages => GiftedChat.append(previousMessages, [msg]));
//     socket.sendMessage(user._id, msg.text, msg.attachment);
//   }, [user._id, currentUser]);

//   // Render message status with enhanced UI
//   const renderMessageStatus = (props) => {
//     const { currentMessage } = props;
//     if (!currentMessage.user || currentMessage.user._id !== currentUser?._id) {
//       return null;
//     }
    
//     let statusIcon;
//     let statusColor = COLORS.textSecondary;
//     let statusText = '';

//     switch (currentMessage.status) {
//       case 'sent':
//         statusIcon = 'check';
//         statusText = 'Sent';
//         break;
//       case 'delivered':
//         statusIcon = 'done-all';
//         statusText = 'Delivered';
//         break;
//       case 'read':
//         statusIcon = 'done-all';
//         statusColor = COLORS.lightGreen;
//         statusText = 'Read';
//         break;
//       default:
//         statusIcon = 'schedule';
//         statusText = 'Sending...';
//         break;
//     }

//     return (
//       <View style={styles.messageStatusContainer}>
//         <Text style={[styles.messageTime, { color: statusColor }]}>
//           {new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </Text>
//         <Icon name={statusIcon} size={12} color={statusColor} style={styles.statusIcon} />
//         <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
//       </View>
//     );
//   };

//   // Custom render bubble with different styles for incoming/outgoing
//   const renderBubble = (props) => {
//     const isOutgoing = props.currentMessage.user._id === currentUser?._id;
    
//     return (
//       <View style={[
//         styles.bubbleContainer,
//         isOutgoing ? styles.outgoingBubbleContainer : styles.incomingBubbleContainer
//       ]}>
//         <Bubble
//           {...props}
//           wrapperStyle={{
//             left: {
//               backgroundColor: COLORS.incomingBg,
//               padding: 8,
//               borderRadius: 18,
//               borderBottomLeftRadius: 4,
//               marginLeft: 8,
//             },
//             right: {
//               backgroundColor: COLORS.outgoingBg,
//               padding: 8,
//               borderRadius: 18,
//               borderBottomRightRadius: 4,
//               marginRight: 8,
//             },
//           }}
//           textStyle={{
//             left: {
//               color: COLORS.textPrimary,
//               fontSize: 15,
//               lineHeight: 20,
//             },
//             right: {
//               color: '#FFFFFF',
//               fontSize: 15,
//               lineHeight: 20,
//             },
//           }}
//           timeTextStyle={{
//             left: { display: 'none' },
//             right: { display: 'none' },
//           }}
//           renderMessageText={(props) => (
//             <View>
//               <MessageText {...props} />
//               {props.currentMessage.attachment && (
//                 <View style={styles.attachmentIndicator}>
//                   <Icon 
//                     name={props.currentMessage.attachment.type === 'video' ? 'videocam' : 'image'} 
//                     size={16} 
//                     color={isOutgoing ? '#FFFFFF' : COLORS.textSecondary} 
//                   />
//                   <Text style={[
//                     styles.attachmentText,
//                     { color: isOutgoing ? '#FFFFFF' : COLORS.textSecondary }
//                   ]}>
//                     {props.currentMessage.attachment.type === 'video' ? 'Video' : 'Photo'}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           )}
//         />
//         {renderMessageStatus(props)}
//       </View>
//     );
//   };

//   // Custom render input toolbar
//   const renderInputToolbar = (props) => (
//     <View>
//       <InputToolbar
//         {...props}
//         containerStyle={styles.inputToolbarContainer}
//         primaryStyle={styles.inputToolbarPrimary}
//         onInputTextChanged={handleInputTextChanged}
//       />
//       {showEmojiPicker && (
//         <View style={styles.emojiPickerContainer}>
//           <EmojiSelector
//             onEmojiSelected={handleEmojiSelect}
//             showSearchBar={false}
//             showHistory={true}
//             showSectionTitles={true}
//             category="all"
//             columns={8}
//             theme={COLORS.cardDark}
//           />
//         </View>
//       )}
//     </View>
//   );

//   // Custom render actions (attachment + emoji)
//   const renderActions = (props) => (
//     <View style={styles.actionsContainer}>
//       <TouchableOpacity 
//         style={styles.actionButton}
//         onPress={() => setShowEmojiPicker(!showEmojiPicker)}
//       >
//         <Icon 
//           name={showEmojiPicker ? "keyboard" : "insert-emoticon"} 
//           size={24} 
//           color={showEmojiPicker ? COLORS.lightGreen : COLORS.textSecondary} 
//         />
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={styles.actionButton}
//         onPress={handlePickAttachment}
//       >
//         <Icon name="attach-file" size={24} color={COLORS.textSecondary} />
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={styles.actionButton}
//         onPress={() => {
//           // Handle camera
//           Alert.alert('Camera', 'Camera feature coming soon!');
//         }}
//       >
//         <Icon name="camera-alt" size={24} color={COLORS.textSecondary} />
//       </TouchableOpacity>
//     </View>
//   );

//   // Custom render send button
//   const renderSend = (props) => (
//     <Send {...props} containerStyle={styles.sendContainer}>
//       <View style={styles.sendButton}>
//         <Icon name="send" size={22} color="#FFFFFF" />
//       </View>
//     </Send>
//   );

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//     >
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
//       {/* Header */}
//       <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
//         <SafeAreaView edges={['top']}>
//           <View style={styles.headerContent}>
//             <TouchableOpacity 
//               onPress={() => navigation.goBack()} 
//               style={styles.backButton}
//               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//             >
//               <Icon name="arrow-back" size={26} color={COLORS.textPrimary} />
//             </TouchableOpacity>
            
//             <TouchableOpacity style={styles.userInfoContainer}>
//               <Image 
//                 source={{ uri: user.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
//                 style={styles.avatar}
//               />
//               <View style={styles.userInfo}>
//                 <Text style={styles.userName}>{user.name}</Text>
//                 <View style={styles.statusContainer}>
//                   {isTyping ? (
//                     <View style={styles.typingContainer}>
//                       <View style={styles.typingDot} />
//                       <View style={[styles.typingDot, styles.typingDotMiddle]} />
//                       <View style={styles.typingDot} />
//                       <Text style={styles.typingText}>Typing...</Text>
//                     </View>
//                   ) : user.isOnline ? (
//                     <View style={styles.onlineContainer}>
//                       <View style={styles.onlineDot} />
//                       <Text style={styles.statusText}>Online</Text>
//                     </View>
//                   ) : (
//                     <Text style={styles.statusText}>Last seen {lastSeen}</Text>
//                   )}
//                 </View>
//               </View>
//             </TouchableOpacity>
            
//             <View style={styles.headerActions}>
//               <TouchableOpacity 
//                 style={styles.headerActionButton}
//                 onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')}
//               >
//                 <Icon name="videocam" size={26} color={COLORS.textPrimary} />
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.headerActionButton}
//                 onPress={() => Alert.alert('Voice Call', 'Voice call feature coming soon!')}
//               >
//                 <Icon name="call" size={24} color={COLORS.textPrimary} />
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.headerActionButton}
//                 onPress={() => setMoreMenuVisible(true)}
//               >
//                 <Icon name="more-vert" size={26} color={COLORS.textPrimary} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </SafeAreaView>
//       </Animated.View>

//       {/* Chat Messages */}
//       <GiftedChat
//         messages={messages}
//         onSend={onSend}
//         user={{ _id: currentUser?._id }}
//         renderBubble={renderBubble}
//         renderInputToolbar={renderInputToolbar}
//         renderActions={renderActions}
//         renderSend={renderSend}
//         alwaysShowSend
//         scrollToBottom
//         scrollToBottomComponent={() => (
//           <View style={styles.scrollToBottomButton}>
//             <Icon name="arrow-downward" size={20} color={COLORS.textPrimary} />
//           </View>
//         )}
//         messagesContainerStyle={styles.messagesContainer}
//         textInputStyle={styles.textInput}
//         placeholder="Type a message..."
//         placeholderTextColor={COLORS.textTertiary}
//         listViewProps={{
//           style: { backgroundColor: COLORS.background },
//           showsVerticalScrollIndicator: false,
//         }}
//       />

//       {/* More Options Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={moreMenuVisible}
//         onRequestClose={() => setMoreMenuVisible(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay} 
//           activeOpacity={1} 
//           onPress={() => setMoreMenuVisible(false)}
//         >
//           <View style={styles.moreMenuContainer}>
//             <View style={styles.moreMenuHandle} />
//             <View style={styles.moreMenuContent}>
//               <Text style={styles.moreMenuTitle}>Conversation Options</Text>
              
//               {[
//                 { 
//                   icon: conversationMetadata.isBlocked ? 'block' : 'block', 
//                   name: conversationMetadata.isBlocked ? 'Unblock User' : 'Block User',
//                   color: COLORS.danger,
//                   onPress: () => handleMoreMenuOption('block')
//                 },
//                 { 
//                   icon: conversationMetadata.isPinned ? 'push-pin' : 'push-pin', 
//                   name: conversationMetadata.isPinned ? 'Unpin Chat' : 'Pin Chat',
//                   color: COLORS.warning,
//                   onPress: () => handleMoreMenuOption('pin')
//                 },
//                 { 
//                   icon: conversationMetadata.isFavorite ? 'favorite' : 'favorite-border', 
//                   name: conversationMetadata.isFavorite ? 'Remove Favorite' : 'Add to Favorite',
//                   color: COLORS.warning,
//                   onPress: () => handleMoreMenuOption('favorite')
//                 },
//                 { 
//                   icon: 'music-note', 
//                   name: 'Custom Ringtone',
//                   color: COLORS.blue,
//                   onPress: () => handleMoreMenuOption('customRingtone')
//                 },
//                 { 
//                   icon: 'delete', 
//                   name: 'Clear Chat',
//                   color: COLORS.danger,
//                   onPress: () => handleMoreMenuOption('clearChat')
//                 },
//                 { 
//                   icon: 'flag', 
//                   name: 'Report User',
//                   color: COLORS.danger,
//                   onPress: () => handleMoreMenuOption('report')
//                 },
//               ].map((item, index) => (
//                 <TouchableOpacity 
//                   key={index}
//                   style={styles.menuOption}
//                   onPress={item.onPress}
//                 >
//                   <Icon name={item.icon} size={24} color={item.color} />
//                   <Text style={styles.menuOptionText}>{item.name}</Text>
//                   <View style={styles.menuOptionSpacer} />
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     backgroundColor: COLORS.primaryDark,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     zIndex: 1000,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   backButton: {
//     padding: 5,
//     marginRight: 10,
//   },
//   userInfoContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     marginRight: 12,
//     borderWidth: 2,
//     borderColor: COLORS.lightGreen,
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     color: COLORS.textPrimary,
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   onlineContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   onlineDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.lightGreen,
//     marginRight: 6,
//   },
//   typingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   typingDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: COLORS.lightGreen,
//     marginHorizontal: 1,
//   },
//   typingDotMiddle: {
//     opacity: 0.7,
//   },
//   typingText: {
//     color: COLORS.lightGreen,
//     fontSize: 12,
//     marginLeft: 8,
//     fontStyle: 'italic',
//   },
//   statusText: {
//     color: COLORS.textSecondary,
//     fontSize: 13,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerActionButton: {
//     padding: 8,
//     marginLeft: 15,
//   },
//   messagesContainer: {
//     backgroundColor: COLORS.background,
//     paddingBottom: 10,
//   },
//   bubbleContainer: {
//     marginVertical: 2,
//   },
//   incomingBubbleContainer: {
//     alignItems: 'flex-start',
//   },
//   outgoingBubbleContainer: {
//     alignItems: 'flex-end',
//   },
//   messageStatusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//     marginHorizontal: 12,
//   },
//   messageTime: {
//     fontSize: 11,
//     marginRight: 6,
//     opacity: 0.8,
//   },
//   statusText: {
//     fontSize: 11,
//     marginLeft: 4,
//   },
//   attachmentIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     padding: 4,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   attachmentText: {
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   inputToolbarContainer: {
//     backgroundColor: COLORS.cardDark,
//     borderTopColor: COLORS.border,
//     borderTopWidth: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     minHeight: 60,
//   },
//   inputToolbarPrimary: {
//     alignItems: 'center',
//   },
//   actionsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   actionButton: {
//     padding: 8,
//     marginRight: 8,
//   },
//   sendContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 4,
//   },
//   sendButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: COLORS.lightGreen,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   textInput: {
//     backgroundColor: COLORS.cardLight,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     flex: 1,
//     marginHorizontal: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   emojiPickerContainer: {
//     height: 300,
//     backgroundColor: COLORS.cardDark,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   scrollToBottomButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   moreMenuContainer: {
//     backgroundColor: COLORS.cardDark,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 30,
//   },
//   moreMenuHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 10,
//     marginBottom: 15,
//   },
//   moreMenuContent: {
//     paddingHorizontal: 20,
//   },
//   moreMenuTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   menuOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   menuOptionText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     marginLeft: 15,
//     flex: 1,
//   },
//   menuOptionSpacer: {
//     width: 24,
//   },
// });

// export default MessageScreen;