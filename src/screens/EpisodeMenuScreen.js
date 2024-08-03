import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  TextInput,
  Alert
} from 'react-native';
import axios from 'axios';
import cheerio from 'cheerio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SaveAnimeButton, SaveEpisodeButton } from '../components/AnimeActions';

const EpisodeCard = ({ title, date, url, onPress, isSaved, onSaveEpisode, lastWatched }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(title, url)}>
    <View style={styles.cardContent}>
      <Text style={styles.episodeTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
      <Text style={styles.episodeDate}>{date}</Text>
      {lastWatched && <Text style={styles.lastWatched}>Last Watched</Text>}
    </View>
    <SaveEpisodeButton onPress={() => onSaveEpisode(title)} isSaved={isSaved} />
  </TouchableOpacity>
);

const EpisodeMenuScreen = ({ navigation, route }) => {
  const { animeUrl } = route.params;
  const [episodeList, setEpisodeList] = useState([]);
  const [filteredEpisodeList, setFilteredEpisodeList] = useState([]);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [savedEpisodes, setSavedEpisodes] = useState({});
  const [savedCategory, setSavedCategory] = useState(null);
  const [lastEpisode, setLastEpisode] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchAnimeInfo();
  }, []);

  useEffect(() => {
    const filtered = episodeList.filter(episode =>
      episode.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => 
      sortOrder === 'asc' 
        ? a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }) 
        : b.title.localeCompare(a.title, undefined, { numeric: true, sensitivity: 'base' }) 
    );
    setFilteredEpisodeList(sorted);
  }, [searchQuery, episodeList, sortOrder]); 

  const fetchAnimeInfo = async () => {
    try {
      const response = await axios.get(animeUrl);
      const $ = cheerio.load(response.data);

      const title = $('h1').first().text().trim();
      const image = $('.fotoanime img').attr('src');
      const info = {};
      $('.infozingle p').each((index, element) => {
        let [key, value] = $(element).text().split(':');
        key = key.trim();
        value = value.trim();
        info[key] = value; 
      });

      setAnimeInfo({ title, image, ...info });

      const episodes = [];
      $('.episodelist')
        .find('li')
        .each((index, element) => {
          const title = $(element).find('a').text().trim();
          const url = $(element).find('a').attr('href');
          const dateParts = $(element).find('.zeebr').text().trim().split(',');
          const formattedDate = `${dateParts[0]}, ${dateParts[1]}`; 
          
          episodes.push({ id: index.toString(), title, url, date: formattedDate });
        });

      setEpisodeList(episodes); 
      setFilteredEpisodeList(episodes);
    } catch (error) {
      console.error('Error fetching anime info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodePress = (title, url) => {
    navigation.navigate('WatchMenu', { 
      episodeUrl: url, 
      episodeTitle: title,
      animeInfo: animeInfo
    });
    // Update last watched episode
    const newSavedEpisodes = { ...savedEpisodes, [title]: true };
    setSavedEpisodes(newSavedEpisodes);
    setLastEpisode(title);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const truncateText = (text) => {
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };

  const handleSaveAnime = () => {
    if (savedCategory) {
      setSavedCategory(null);
      Alert.alert("Anime Removed", "This anime has been removed from your saved list.");
    } else {
      showSaveCategoryOptions();
    }
  };

  const showSaveCategoryOptions = () => {
    Alert.alert(
      "Save Anime",
      "Choose a category",
      [
        {
          text: "Watch List",
          onPress: () => setSavedCategory('watchList')
        },
        {
          text: "On Going",
          onPress: () => setSavedCategory('onGoing')
        },
        {
          text: "Completed",
          onPress: () => setSavedCategory('completed')
        }
      ]
    );
  };

  const handleSaveEpisode = (episodeTitle) => {
    setSavedEpisodes(prev => ({
      ...prev,
      [episodeTitle]: !prev[episodeTitle]
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading anime info...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {animeInfo && (
        <View style={styles.animeInfoContainer}>
          <Image source={{ uri: animeInfo.image }} style={styles.animeImage} />
          <View style={styles.animeDetails}>
            <Text style={styles.animeTitle} numberOfLines={2} ellipsizeMode="tail">
              {truncateText(animeInfo.title)}
            </Text>
            <Text style={styles.animeInfoText} numberOfLines={2} ellipsizeMode="tail">
              <Text style={styles.boldText}>Japanese:</Text> {truncateText(animeInfo.Japanese)}
            </Text>
            <Text style={styles.animeInfoText}><Text style={styles.boldText}>Status:</Text> {animeInfo.Status}</Text>
            <Text style={styles.animeInfoText}><Text style={styles.boldText}>Episodes:</Text> {animeInfo['Total Episode']}</Text>
            <Text style={styles.animeInfoText}><Text style={styles.boldText}>Duration:</Text> {animeInfo.Durasi}</Text>
            <Text style={styles.animeInfoText} numberOfLines={2} ellipsizeMode="tail">
              <Text style={styles.boldText}>Genre:</Text> {truncateText(animeInfo.Genre)}
            </Text>
          </View>
          <SaveAnimeButton 
            onPress={handleSaveAnime} 
            isSaved={!!savedCategory} 
            category={savedCategory} 
          />
        </View>
      )}

      <View style={styles.episodeListHeader}>
        <Text style={styles.episodeListHeaderText} numberOfLines={1} ellipsizeMode="tail">
          Episode List
        </Text>
        <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
          <Ionicons 
            name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search episodes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredEpisodeList}
        renderItem={({ item }) => (
          <EpisodeCard
            title={item.title}
            date={item.date}
            url={item.url}
            onPress={handleEpisodePress}
            isSaved={savedEpisodes[item.title]}
            onSaveEpisode={handleSaveEpisode}
            lastWatched={item.title === lastEpisode}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.episodeList} 
        style={styles.episodeListContainer} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f4511e',
  },
  animeInfoContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  animeImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginRight: 15,
  },
  animeDetails: {
    flex: 1,
  },
  animeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 10,
  },
  animeInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  episodeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f4511e',
  },
  episodeListHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    maxWidth: 200,
  },
  sortButton: {
    padding: 5,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  episodeListContainer: {
    flexGrow: 1, 
  },
  episodeList: {
    paddingHorizontal: 10,
    paddingTop: 10 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: { 
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  episodeDate: {
    fontSize: 14,
    color: '#666',
  },
  lastWatched: {
    fontSize: 12,
    color: '#f4511e',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default EpisodeMenuScreen;