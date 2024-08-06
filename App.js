import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/redux/store';
import { loadUsername } from './src/redux/userSlice';

import DashboardScreen from './src/screens/DashboardScreen';
import EpisodeMenuScreen from './src/screens/EpisodeMenuScreen';
import WatchMenuScreen from './src/screens/WatchMenuScreen';
import SearchScreen from './src/screens/SearchScreen';
import InfoScreen from './src/screens/InfoScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerTitleAlign: 'left',
      headerBackTitleVisible: false,
      contentStyle: {
        backgroundColor: '#fff',
      },
    }}
  >
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ 
        title: 'Update Terbaru',
      }}
    />
    <Stack.Screen 
      name="EpisodeMenu" 
      component={EpisodeMenuScreen}
      options={{ 
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="InfoScreen" 
      component={InfoScreen}
      options={{ 
        title: 'Info',
      }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerTitleAlign: 'left',
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{
        title: 'Profile'
      }}
    />
    <Stack.Screen
      name="ProfileSettings"
      component={ProfileSettingsScreen}
      options={{
        title: 'Profile Settings',
      }}
    />
  </Stack.Navigator>
);

const TabNavigator = ({ isFullscreen }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Search') {
          iconName = focused ? 'search' : 'search-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#f4511e',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        height: 60,
        paddingBottom: 5,
        borderTopWidth: 0,
        display: isFullscreen ? 'none' : 'flex',
      },
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerTitleAlign: 'left',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStack} 
      options={{ 
        headerShown: false,
        title: 'NekoTan'
      }} 
    />
    <Tab.Screen 
      name="Search" 
      component={SearchScreen}
      options={{
        headerShown: !isFullscreen,
        title: 'Search Anime'
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{
        headerShown: false,
        title: 'Profile'
      }}
    />
  </Tab.Navigator>
);

const RootStack = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    StatusBar.setHidden(isFullscreen);
  }, [isFullscreen]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs">
          {() => <TabNavigator isFullscreen={isFullscreen} />}
        </Stack.Screen>
        <Stack.Screen 
          name="EpisodeMenu" 
          component={EpisodeMenuScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="WatchMenu" 
          options={({ route }) => {
            const episodeTitle = route.params.episodeTitle;
            const episodeMatch = episodeTitle.match(/Episode\s+(\d+)/i);
            const title = episodeMatch ? `Episode ${episodeMatch[1]}` : episodeTitle;

            return {
              headerStyle: {
                backgroundColor: '#f4511e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 16,
              },
              headerTitleAlign: 'left',
              headerBackTitleVisible: false,
              title: title,
              headerShown: !isFullscreen,
            };
          }}
        >
          {(props) => (
            <WatchMenuScreen 
              {...props} 
              onFullscreenChange={setIsFullscreen}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </View>
  );
};

const AppWrapper = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUsername());
  }, [dispatch]);

  return <RootStack />;
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar backgroundColor="#f4511e" barStyle="light-content" />
          <AppWrapper />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;