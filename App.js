import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import EpisodeMenuScreen from './src/screens/EpisodeMenuScreen';
import WatchMenuScreen from './src/screens/WatchMenuScreen';
import SearchScreen from './src/screens/SearchScreen';
import InfoScreen from './src/screens/InfoScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainStack = () => (
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
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ 
        title: 'NekoTan - Nonton Anime',
      }}
    />
    <Stack.Screen 
      name="EpisodeMenu" 
      component={EpisodeMenuScreen}
      options={({ route }) => ({ 
        title: route.params.title,
        headerTitleStyle: {
          fontSize: 16,
        },
      })}
    />
    <Stack.Screen 
      name="WatchMenu" 
      component={WatchMenuScreen}
      options={({ route }) => {
        const episodeTitle = route.params.episodeTitle;
        const episodeNumberMatch = episodeTitle.match(/Episode\s+(\d+)/i);
        const title = episodeNumberMatch ? episodeNumberMatch[0] : episodeTitle;

        return {
          title: title,
          headerTitleStyle: {
            fontSize: 16,
          },
        };
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

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Search') {
          iconName = focused ? 'search' : 'search-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#f4511e',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        height: 60,
        paddingBottom: 5,
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
      component={MainStack} 
      options={{ 
        headerShown: false,
        title: 'Home'
      }} 
    />
    <Tab.Screen 
      name="Search" 
      component={SearchScreen}
      options={{
        title: 'Search Anime'
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#f4511e" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
