import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { View, ActivityIndicator } from 'react-native';

// Screens
import HomeScreen from './src/homescreen';
import FriendsScreen from './src/FriendsScreen';
import CreateScreen from './src/CreateScreen';
import ChatScreen from './src/ChatScreen';
import ProfileScreen from './src/ProfileScreen';
import LoginScreen from './src/login';
import RegisterScreen from './src/register';
import CameraScreen from './src/Create/Camera';
import UploadScreen from './src/Create/Upload';
import AIGenerateScreen from './src/Create/AIGenerate';
import TemplatesScreen from './src/Create/Templates';
import NearbyFriends from './src/NearBy_Friends/NearbyFriends';
import MessageScreen from './src/MessageScreen';

// Notification screens
import Notification from './src/notifycation/notifycation';
import Admin from './src/notifycation/Admin';
import PersonalNotifications from './src/notifycation/PersonalNotifications';

// Search screen
import SearchScreen from './src/SearchScreen';

// Context
import { UserProvider, useUser } from './src/context/UserContext';

// Theme
import { theme } from './styles/theme';
import { getFCMToken, setupNotificationListeners } from './src/services/pushNotificationHelper';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const CreateStack = createStackNavigator();

// Nested Create stack
const CreateStackScreen = () => (
  <CreateStack.Navigator screenOptions={{ headerShown: false }}>
    <CreateStack.Screen name="CreateMain" component={CreateScreen} />
    <CreateStack.Screen name="Camera" component={CameraScreen} />
    <CreateStack.Screen name="Upload" component={UploadScreen} />
    <CreateStack.Screen name="AIGenerate" component={AIGenerateScreen} />
    <CreateStack.Screen name="Templates" component={TemplatesScreen} />
  </CreateStack.Navigator>
);

// Friends Stack for nested navigation
const FriendsStack = createStackNavigator();

const FriendsStackScreen = () => (
  <FriendsStack.Navigator screenOptions={{ headerShown: false }}>
    <FriendsStack.Screen name="FriendsMain" component={FriendsScreen} />
    <FriendsStack.Screen name="FriendRequests" component={PersonalNotifications} />
    <FriendsStack.Screen name="AllFriends" component={FriendsScreen} initialParams={{ showAll: true }} />
  </FriendsStack.Navigator>
);

// Profile Stack for nested navigation
const ProfileStack = createStackNavigator();

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="ProfileView" component={ProfileScreen} />
  </ProfileStack.Navigator>
);

// Bottom tab navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Friends') iconName = 'user-friends';
        else if (route.name === 'Create') iconName = 'plus-square';
        else if (route.name === 'Chat') iconName = 'comment';
        else if (route.name === 'Profile') iconName = 'user';

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.accentColor,
      tabBarInactiveTintColor: theme.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.headerBg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 12,
      },
      tabBarLabelStyle: { fontSize: 12 },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Friends" component={FriendsStackScreen} />
    <Tab.Screen name="Create" component={CreateStackScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="Profile" component={ProfileStackScreen} />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { user, loading } = useUser();
  const navigationRef = React.useRef(null);

  useEffect(() => {
    if (user && navigationRef.current) {
      getFCMToken();
      setupNotificationListeners(navigationRef.current);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.background 
      }}>
        <ActivityIndicator size="large" color={theme.accentColor} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: theme.background }
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            
            {/* Modal/Overlay screens */}
            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            
            <Stack.Screen 
              name="Notifications" 
              component={Notification}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            
            <Stack.Screen 
              name="AdminNotifications" 
              component={Admin}
              options={{
                presentation: 'modal',
                animation: 'slide_from_right'
              }}
            />
            
            <Stack.Screen 
              name="NearbyFriends" 
              component={NearbyFriends}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            
            {/* Standalone screens */}
            <Stack.Screen name="PersonalNotifications" component={PersonalNotifications} />
            <Stack.Screen name="Message" component={MessageScreen} />
          </>
        ) : (
          // Authentication screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animationTypeForReplace: 'pop'
              }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{
                animation: 'slide_from_right'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
};

export default App;




// // App.js - COMPLETELY REPLACE THIS FILE
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons/FontAwesome5';

// // Screens
// import HomeScreen from './src/homescreen';
// import FriendsScreen from './src/FriendsScreen';
// import CreateScreen from './src/CreateScreen';
// import ChatScreen from './src/ChatScreen';
// import ProfileScreen from './src/ProfileScreen';
// import LoginScreen from './src/login';
// import RegisterScreen from './src/register';
// import CameraScreen from './src/Create/Camera';
// import UploadScreen from './src/Create/Upload';
// import AIGenerateScreen from './src/Create/AIGenerate';
// import TemplatesScreen from './src/Create/Templates';
// import NearbyFriends from './src/NearBy_Friends/NearbyFriends';

// // Additional screens
// import SearchScreen from './src/SearchScreen';
// import Notification from './src/notifycation/notifycation';
// import Admin from './src/notifycation/Admin';
// //    import PersonalNotifications from './src/notifycation/PersonalNotifications';

// // Context
// import { UserProvider, useUser } from './src/context/UserContext';

// // Theme & Config
// import { theme } from './styles/theme';

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();
// const CreateStack = createStackNavigator();

// // Nested Create stack
// const CreateStackScreen = () => (
//   <CreateStack.Navigator screenOptions={{ headerShown: false }}>
//     <CreateStack.Screen name="CreateMain" component={CreateScreen} />
//     <CreateStack.Screen name="Camera" component={CameraScreen} />
//     <CreateStack.Screen name="Upload" component={UploadScreen} />
//     <CreateStack.Screen name="AIGenerate" component={AIGenerateScreen} />
//     <CreateStack.Screen name="Templates" component={TemplatesScreen} />
//   </CreateStack.Navigator>
// );

// // Bottom tab navigator
// const MainTabs = () => (
//   <Tab.Navigator
//     screenOptions={({ route }) => ({
//       tabBarIcon: ({ color, size }) => {
//         let iconName;
//         if (route.name === 'Home') iconName = 'home';
//         else if (route.name === 'Friends') iconName = 'user-friends';
//         else if (route.name === 'Create') iconName = 'plus-square';
//         else if (route.name === 'Chat') iconName = 'comment';
//         else if (route.name === 'Profile') iconName = 'user';

//         return <Icon name={iconName} size={size} color={color} />;
//       },
//       tabBarActiveTintColor: theme.accentColor,
//       tabBarInactiveTintColor: theme.textSecondary,
//       tabBarStyle: {
//         backgroundColor: theme.headerBg,
//         borderTopWidth: 1,
//         borderTopColor: 'rgba(255, 255, 255, 0.1)',
//         paddingVertical: 12,
//       },
//       tabBarLabelStyle: { fontSize: 12 },
//       headerShown: false,
//     })}
//   >
//     <Tab.Screen name="Home" component={HomeScreen} />
//     <Tab.Screen name="Friends" component={FriendsScreen} />
//     <Tab.Screen name="Create" component={CreateStackScreen} />
//     <Tab.Screen name="Chat" component={ChatScreen} />
//     <Tab.Screen name="Profile" component={ProfileScreen} />
//   </Tab.Navigator>
// );

// // Main App Navigator
// const AppNavigator = () => {
//   const { user, loading } = useUser();

//   if (loading) {
//     return null; // You can show a splash screen here
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {user ? (
//           <>
//             <Stack.Screen name="Main" component={MainTabs} />
//             <Stack.Screen name="Search" component={SearchScreen} />
//             <Stack.Screen name="Notifications" component={Notification} />
//            {/* <Stack.Screen name="PersonalNotifications" component={PersonalNotifications} /> */}
//             <Stack.Screen name="AdminNotifications" component={Admin} />
//             <Stack.Screen name="NearbyFriends" component={NearbyFriends} />
//           </>
//         ) : (
//           <>
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="Register" component={RegisterScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// const App = () => {
//   return (
//     <UserProvider>
//       <AppNavigator />
//     </UserProvider>
//   );
// };

// export default App;
