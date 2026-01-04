import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Image, 
  TouchableOpacity, 
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../styles/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './utiliti/config';

const FriendsScreen = () => {
  const navigation = useNavigation();

  // State variables
  const [friends, setFriends] = useState([]);
  const [addFriends, setAddFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'suggestions', 'requests'

  // Refresh data function
  const fetchFriendsData = useCallback(async () => {
    setRefreshing(true);
    setApiError(false);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.warn('No authentication token found.');
        setRefreshing(false);
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // Fetch friends
      try {
        const friendsResponse = await fetch(`${API_URL}/api/friends`, { 
          method: 'GET', 
          headers 
        });
        
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          setFriends(friendsData.friends || []);
        } else {
          console.error('Failed to fetch friends:', friendsResponse.status);
          setFriends([]);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }

      // Fetch friend suggestions
      try {
        const suggestionsResponse = await fetch(`${API_URL}/api/friends/suggestions`, { 
          method: 'GET', 
          headers 
        });
        
        if (suggestionsResponse.ok) {
          const suggestionsData = await suggestionsResponse.json();
          setAddFriends(suggestionsData.suggestions || []);
        } else {
          console.error('Failed to fetch suggestions:', suggestionsResponse.status);
          setAddFriends([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }

      // Fetch pending friend requests
      try {
        const requestsResponse = await fetch(`${API_URL}/api/friends/requests/pending`, { 
          method: 'GET', 
          headers 
        });
        
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setPendingRequests(requestsData.requests || []);
        } else {
          console.error('Failed to fetch requests:', requestsResponse.status);
          setPendingRequests([]);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      }

    } catch (error) {
      console.error('Error fetching friends data:', error);
      setApiError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFriendsData();
    }, [fetchFriendsData])
  );

  // --- Action Handlers ---
  const handleNearbyFriendsPress = () => {
    navigation.navigate('NearbyFriends');
  };

  const handleAddFriend = async (user) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Not authenticated.');
        return;
      }

      const response = await fetch(`${API_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUserId: user.id,
          message: `Hi ${user.name}, I'd like to connect with you on Reels2Chat!`
        }),
      });

      if (response.ok) {
        Alert.alert('Success', `Friend request sent to ${user.name}`);
        
        // Update the UI immediately
        setAddFriends(prev => prev.map(friend => 
          friend.id === user.id 
            ? { ...friend, requestStatus: 'request_sent' }
            : friend
        ));
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId, userName) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Not authenticated.');
        return;
      }

      const response = await fetch(`${API_URL}/api/friends/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', `Accepted friend request from ${userName}`);
        
        // Update the UI
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        fetchFriendsData(); // Refresh friends list
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId, userName) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Not authenticated.');
        return;
      }

      const response = await fetch(`${API_URL}/api/friends/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', `Rejected friend request from ${userName}`);
        
        // Update the UI
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleChat = (user) => {
    navigation.navigate('Message' as never, { 
      user: user, 
    });
  };

  const handleViewProfile = (user) => {
    navigation.navigate('ProfileView', { 
      userId: user.id,
      userName: user.name 
    });
  };

  // --- Render Functions ---
  const renderFriend = ({ item }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity onPress={() => handleViewProfile(item)}>
        <Image 
          source={{ uri: item.avatar || item.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
          style={styles.friendAvatar} 
        />
      </TouchableOpacity>
      <View style={styles.friendInfo}>
        <TouchableOpacity onPress={() => handleViewProfile(item)}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendStatus}>{item.status || 'Friend'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.friendChatBtn}
        onPress={() => handleChat(item)}
      >
        <Icon name="chat" size={16} color="#fff" />
        <Text style={styles.friendChatBtnText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuggestion = ({ item }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity onPress={() => handleViewProfile(item)}>
        <Image 
          source={{ uri: item.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
          style={styles.friendAvatar} 
        />
      </TouchableOpacity>
      <View style={styles.friendInfo}>
        <TouchableOpacity onPress={() => handleViewProfile(item)}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendStatus}>{item.status || 'Suggested'}</Text>
        </TouchableOpacity>
      </View>
      {item.requestStatus === 'add_friend' ? (
        <TouchableOpacity 
          style={styles.addFriendBtn}
          onPress={() => handleAddFriend(item)}
        >
          <Icon name="person-add" size={16} color="#fff" />
          <Text style={styles.addFriendBtnText}>Add</Text>
        </TouchableOpacity>
      ) : item.requestStatus === 'request_sent' ? (
        <View style={styles.requestSentBtn}>
          <Icon name="schedule" size={16} color={theme.textSecondary} />
          <Text style={styles.requestSentText}>Sent</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.pendingRequestBtn}
          onPress={() => navigation.navigate('FriendRequests' as never)}
        >
          <Icon name="notifications" size={16} color="#fff" />
          <Text style={styles.pendingRequestText}>View</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <TouchableOpacity onPress={() => handleViewProfile(item.fromUser)}>
        <Image 
          source={{ uri: item.fromUser.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
          style={styles.friendAvatar} 
        />
      </TouchableOpacity>
      <View style={styles.requestInfo}>
        <TouchableOpacity onPress={() => handleViewProfile(item.fromUser)}>
          <Text style={styles.friendName}>{item.fromUser.name}</Text>
          <Text style={styles.friendStatus}>
            {item.fromUser.bio ? item.fromUser.bio.substring(0, 50) + '...' : 'Wants to connect with you'}
          </Text>
          {item.message && (
            <Text style={styles.requestMessage}>"{item.message}"</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={styles.acceptBtn}
          onPress={() => handleAcceptRequest(item.id, item.fromUser.name)}
        >
          <Icon name="check" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rejectBtn}
          onPress={() => handleRejectRequest(item.id, item.fromUser.name)}
        >
          <Icon name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- Loading State UI ---
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={theme.headerBg} />
        <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accentColor} />
            <Text style={styles.loadingText}>Loading friends...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // --- Main Render UI ---
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.headerBg} />
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
        <View style={styles.containerInner}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="people" size={22} color={theme.accentColor} />
              <Text style={styles.logo}>REELS2CHAT</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.headerIcon} 
                onPress={() => navigation.navigate('Search')}
              >
                <Icon name="search" size={18} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIcon} 
                onPress={() => navigation.navigate('FriendRequests')}
              >
                <Icon name="mail" size={18} color={theme.textPrimary} />
                {pendingRequests.length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>
                      {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
                onPress={() => setActiveTab('friends')}
              >
                <Icon 
                  name="people" 
                  size={16} 
                  color={activeTab === 'friends' ? theme.accentColor : theme.textSecondary} 
                />
                <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                  Friends ({friends.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
                onPress={() => setActiveTab('suggestions')}
              >
                <Icon 
                  name="person-add" 
                  size={16} 
                  color={activeTab === 'suggestions' ? theme.accentColor : theme.textSecondary} 
                />
                <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
                  Suggestions ({addFriends.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                onPress={() => setActiveTab('requests')}
              >
                <Icon 
                  name="mail" 
                  size={16} 
                  color={activeTab === 'requests' ? theme.accentColor : theme.textSecondary} 
                />
                <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                  Requests ({pendingRequests.length})
                </Text>
                {pendingRequests.length > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.content}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchFriendsData}
                  colors={[theme.accentColor]}
                  tintColor={theme.accentColor}
                />
              }
            >
              {/* API Error Message */}
              {apiError && (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={24} color="#ff6b6b" />
                  <Text style={styles.errorText}>Some features may not be available due to server issues.</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchFriendsData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Friends Tab Content */}
              {activeTab === 'friends' && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitle}>
                      <Icon name="people" size={16} color={theme.accentColor} style={styles.sectionTitleIcon} />
                      <Text style={styles.sectionTitleText}>My Friends</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('AllFriends' as never)}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={friends}
                    renderItem={renderFriend}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    scrollEnabled={false}
                    style={styles.friendsList}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyContainer}>
                        <Icon name="people-outline" size={48} color={theme.textSecondary} />
                        <Text style={styles.emptyListText}>
                          {apiError ? "Unable to load friends" : "No friends yet. Start adding some!"}
                        </Text>
                        <TouchableOpacity 
                          style={styles.emptyActionBtn}
                          onPress={() => setActiveTab('suggestions')}
                        >
                          <Text style={styles.emptyActionText}>Find Friends</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>
              )}

              {/* Suggestions Tab Content */}
              {activeTab === 'suggestions' && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitle}>
                      <Icon name="person-add" size={16} color={theme.accentColor} style={styles.sectionTitleIcon} />
                      <Text style={styles.sectionTitleText}>People You May Know</Text>
                    </View>
                    <Text style={styles.suggestionSubtitle}>Based on your birth year</Text>
                  </View>
                  <FlatList
                    data={addFriends}
                    renderItem={renderSuggestion}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    scrollEnabled={false}
                    style={styles.friendsList}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyContainer}>
                        <Icon name="person-search" size={48} color={theme.textSecondary} />
                        <Text style={styles.emptyListText}>
                          {apiError ? "Unable to load suggestions" : "No suggestions right now."}
                        </Text>
                        <Text style={styles.emptySubtext}>Complete your profile to get better suggestions.</Text>
                      </View>
                    )}
                  />
                </View>
              )}

              {/* Requests Tab Content */}
              {activeTab === 'requests' && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitle}>
                      <Icon name="mail" size={16} color={theme.accentColor} style={styles.sectionTitleIcon} />
                      <Text style={styles.sectionTitleText}>Friend Requests</Text>
                    </View>
                    {pendingRequests.length > 0 && (
                      <TouchableOpacity onPress={() => navigation.navigate('AllRequests' as never)}>
                        <Text style={styles.seeAllText}>See All</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <FlatList
                    data={pendingRequests}
                    renderItem={renderRequest}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    scrollEnabled={false}
                    style={styles.friendsList}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyContainer}>
                        <Icon name="mail-outline" size={48} color={theme.textSecondary} />
                        <Text style={styles.emptyListText}>No pending friend requests</Text>
                        <Text style={styles.emptySubtext}>When someone sends you a request, it will appear here.</Text>
                      </View>
                    )}
                  />
                </View>
              )}

              {/* Nearby Friends Button (Always visible) */}
              <View style={styles.nearbyButtonContainer}>
                <TouchableOpacity 
                  style={styles.nearbyButton}
                  onPress={handleNearbyFriendsPress}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.nearbyButtonGradient}
                  >
                    <Icon name="location-on" size={20} color="#fff" style={styles.nearbyButtonIcon} />
                    <Text style={styles.nearbyButtonText}>NEARBY FRIENDS</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* VIP Feature Description */}
                <View style={styles.vipDescription}>
                  <Icon name="star" size={16} color="#FFD700" style={styles.vipIcon} />
                  <Text style={styles.vipText}>VIP Exclusive Feature - Unlock nearby connections</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  containerInner: {
    maxWidth: 480,
    width: '100%',
    flex: 1,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(18, 24, 38, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textPrimary,
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabsContainer: {
    backgroundColor: 'rgba(18, 24, 38, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 0, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 80, 0.3)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: theme.accentColor,
  },
  tabBadge: {
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: 'rgba(30, 40, 50, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleIcon: {
    marginRight: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  seeAllText: {
    color: theme.accentColor,
    fontSize: 13,
    fontWeight: '600',
  },
  friendsList: {
    marginBottom: 10,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  requestInfo: {
    flex: 1,
    marginRight: 10,
  },
  friendName: {
    fontWeight: '600',
    fontSize: 16,
    color: theme.textPrimary,
  },
  friendStatus: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 3,
  },
  requestMessage: {
    fontSize: 12,
    color: theme.accentColor,
    marginTop: 4,
    fontStyle: 'italic',
  },
  friendChatBtn: {
    backgroundColor: theme.accentColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  friendChatBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  addFriendBtn: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addFriendBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  requestSentBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  requestSentText: {
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  pendingRequestBtn: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pendingRequestText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#FF4757',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyListText: {
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyActionBtn: {
    backgroundColor: theme.accentColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 20,
  },
  emptyActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  nearbyButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  nearbyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  nearbyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  nearbyButtonIcon: {
    marginRight: 10,
  },
  nearbyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  vipDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  vipIcon: {
    marginRight: 8,
  },
  vipText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.textPrimary,
    marginTop: 10,
    fontSize: 16,
  },
});

export default FriendsScreen;