import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnimeCard = ({ title, image, category, lastWatched, onPress }) => {
  const lastEpisode = lastWatched ? lastWatched.match(/Episode\s+(\d+)/i) : null;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
        <View style={styles.cardInfo}>
          <View style={[styles.categoryTag, styles[`${category}Tag`]]}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          {lastEpisode && (
            <View style={styles.lastWatchedTag}>
              <Text style={styles.lastWatchedText}>{lastEpisode[0]}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CategorySection = ({ title, data, navigation, lastWatched }) => {
  const [expanded, setExpanded] = useState(false);
  const displayData = expanded ? data : data.slice(0, 2);

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{title}</Text>
        {data.length > 2 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.seeAllButton}>{expanded ? 'Hide' : 'See All'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.categoryContent}>
        {displayData.map((item) => (
          <AnimeCard
            key={item.title}
            title={item.title}
            image={item.image}
            category={item.category}
            lastWatched={lastWatched[item.title]}
            onPress={() => navigation.navigate('EpisodeMenu', { animeUrl: item.url, title: item.title })}
          />
        ))}
      </View>
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const [savedAnimes, setSavedAnimes] = useState({});
  const [lastWatched, setLastWatched] = useState({});
  const [username, setUsername] = useState('NekoTan User');
  const insets = useSafeAreaInsets();

  const [uniqueAnimes, setUniqueAnimes] = useState({});
  const [animeCount, setAnimeCount] = useState({
    watchList: 0,
    onGoing: 0,
    completed: 0
  });

  const loadData = useCallback(async () => {
    try {
      const savedAnimesData = await AsyncStorage.getItem('savedAnimes');
      const lastWatchedData = await AsyncStorage.getItem('lastWatched');
      const usernameData = await AsyncStorage.getItem('username');

      if (savedAnimesData) setSavedAnimes(JSON.parse(savedAnimesData));
      if (lastWatchedData) setLastWatched(JSON.parse(lastWatchedData));
      if (usernameData) setUsername(usernameData);

      processAnimeData(JSON.parse(savedAnimesData) || {});
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const processAnimeData = (animes) => {
    const uniqueAnimesObj = {};
    const counts = {
      watchList: 0,
      onGoing: 0,
      completed: 0
    };

    Object.values(animes).forEach(anime => {
      if (!uniqueAnimesObj[anime.title]) {
        uniqueAnimesObj[anime.title] = anime;
        counts[anime.category]++;
      }
    });

    setUniqueAnimes(uniqueAnimesObj);
    setAnimeCount(counts);
  };

  const removeAnime = async (animeTitle) => {
    try {
      const updatedSavedAnimes = { ...savedAnimes };
      delete updatedSavedAnimes[animeTitle];
      await AsyncStorage.setItem('savedAnimes', JSON.stringify(updatedSavedAnimes));
      setSavedAnimes(updatedSavedAnimes);
      processAnimeData(updatedSavedAnimes);
      Alert.alert("Anime Removed", "The anime has been removed from your list.");
    } catch (error) {
      console.error('Error removing anime:', error);
      Alert.alert("Error", "Failed to remove anime. Please try again.");
    }
  };

  const categorizedAnimes = {
    watchList: [],
    onGoing: [],
    completed: []
  };

  Object.values(uniqueAnimes).forEach(anime => {
    if (categorizedAnimes[anime.category]) {
      categorizedAnimes[anime.category].push(anime);
    }
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person-circle" size={80} color="#f4511e" />
        </View>
        <Text style={styles.username}>{username}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{animeCount.watchList}</Text>
            <Text style={styles.statLabel}>Watch List</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{animeCount.onGoing}</Text>
            <Text style={styles.statLabel}>On Going</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{animeCount.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Ionicons name="settings-outline" size={24} color="#f4511e" />
            <Text style={styles.settingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={[
          { title: 'Watch List', data: categorizedAnimes.watchList },
          { title: 'On Going', data: categorizedAnimes.onGoing },
          { title: 'Completed', data: categorizedAnimes.completed }
        ]}
        renderItem={({ item }) => (
          <CategorySection
            title={item.title}
            data={item.data}
            navigation={navigation}
            lastWatched={lastWatched}
          />
        )}
        keyExtractor={(item) => item.title}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No saved animes yet. Start adding some!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginVertical: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f4511e',
    justifyContent: 'center',
  },
  settingsButtonText: {
    marginLeft: 5,
    color: '#f4511e',
    fontWeight: 'bold',
  },
  categorySection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    color: '#f4511e',
    fontWeight: 'bold',
  },
  categoryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  watchListTag: {
    backgroundColor: '#FFD700',
  },
  onGoingTag: {
    backgroundColor: '#32CD32',
  },
  completedTag: {
    backgroundColor: '#4169E1',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  lastWatchedTag: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lastWatchedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;