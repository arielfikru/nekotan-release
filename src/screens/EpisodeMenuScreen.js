import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  TextInput,
  Alert,
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import cheerio from 'cheerio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SaveAnimeButton, SaveEpisodeButton } from '../components/AnimeActions';
import { saveAnime, removeAnime, setLastWatched } from '../redux/animeSlice';

const EpisodeCard = ({ title, date, url, onPress, isLastWatched, onLastWatchedPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(title, url)}>
    <View style={styles.cardContent}>
      <Text style={styles.episodeTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
      <Text style={styles.episodeDate}>{date}</Text>
    </View>
    <SaveEpisodeButton
      onPress={() => onLastWatchedPress(title)}
      isSaved={isLastWatched}
    />
  </TouchableOpacity>
);

const EpisodeMenuScreen = ({ navigation, route }) => {
  const { animeUrl, title: animeTitle } = route.params;
  const [episodeList, setEpisodeList] = useState([]);
  const [filteredEpisodeList, setFilteredEpisodeList] = useState([]);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [batchDownload, setBatchDownload] = useState(null);

  const dispatch = useDispatch();
  const savedAnimes = useSelector((state) => state.anime.savedAnimes);
  const lastWatched = useSelector((state) => state.anime.lastWatched);

  const savedAnime = savedAnimes[animeTitle];
  const isSaved = !!savedAnime;
  const savedCategory = isSaved ? savedAnime.category : null;

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const fetchAnimeInfo = useCallback(async () => {
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
      let batchInfo = null;

      $('.episodelist').each((index, element) => {
        const $element = $(element);
        const $title = $element.find('.monktit').text().trim();
        
        $element.find('ul li').each((i, li) => {
          const $li = $(li);
          const $link = $li.find('a');
          const title = $link.text().trim();
          const url = $link.attr('href');
          const date = $li.find('.zeebr').text().trim();
          console.log('Raw date string:', date); // Debugging line

          if (title.includes('[BATCH]') || title.includes('Episode 1 –') || title.includes('Episode 1 -')) {
            batchInfo = { title, url, date };
          } else {
            episodes.push({ id: `${index}-${i}`, title, url, date: formatDate(date) });
          }
        });
      });

      setEpisodeList(episodes);
      setFilteredEpisodeList(episodes);
      setBatchDownload(batchInfo);
    } catch (error) {
      console.error('Error fetching anime info:', error);
    } finally {
      setLoading(false);
    }
  }, [animeUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return ''; 
    
    dateString = dateString.trim();
    
    if (dateString.includes(',')) {
      const [dayMonth, year] = dateString.split(',');
      if (dayMonth && year) {
        return `${dayMonth.trim()}, ${year.trim()}`;
      }
    }
    
    return dateString;
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnimeInfo();
    }, [fetchAnimeInfo])
  );

  useEffect(() => {
    const filtered = episodeList.filter(episode =>
      episode.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      const aNumber = parseInt(a.title.match(/\d+/)?.[0] || '0', 10);
      const bNumber = parseInt(b.title.match(/\d+/)?.[0] || '0', 10);
      return sortOrder === 'desc' ? bNumber - aNumber : aNumber - bNumber;
    });
    setFilteredEpisodeList(sorted);
  }, [searchQuery, episodeList, sortOrder]);

  const handleEpisodePress = (title, url) => {
    navigation.navigate('WatchMenu', { 
      episodeUrl: url, 
      episodeTitle: title,
      animeInfo: animeInfo
    });
  };

  const handleBatchPress = () => {
    if (batchDownload) {
      navigation.navigate('BatchMenu', { 
        batchUrl: batchDownload.url, 
        batchTitle: batchDownload.title,
        animeInfo: animeInfo
      });
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const truncateText = (text) => {
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };

  const handleSaveAnime = () => {
    if (isSaved) {
      dispatch(removeAnime(animeTitle))
        .then(() => {
          Alert.alert("Anime Removed", "This anime has been removed from your saved list.");
        })
        .catch((error) => {
          console.error('Error removing anime:', error);
          Alert.alert("Error", "Failed to remove anime. Please try again.");
        });
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
          onPress: () => saveAnimeWithInfo('watchList')
        },
        {
          text: "On Going",
          onPress: () => saveAnimeWithInfo('onGoing')
        },
        {
          text: "Completed",
          onPress: () => saveAnimeWithInfo('completed')
        }
      ]
    );
  };

  const saveAnimeWithInfo = (category) => {
    if (isSaved) {
      Alert.alert("Already Saved", `This anime is already saved in the ${savedCategory} category.`);
    } else {
      dispatch(saveAnime({
        animeId: animeTitle,
        category,
        title: animeInfo.title,
        image: animeInfo.image,
        url: animeUrl
      }))
        .then(() => {
          Alert.alert("Anime Saved", `This anime has been saved to your ${category} list.`);
        })
        .catch((error) => {
          console.error('Error saving anime:', error);
          Alert.alert("Error", "Failed to save anime. Please try again.");
        });
    }
  };

  const handleLastWatchedPress = (episodeTitle) => {
    dispatch(setLastWatched({ animeId: animeTitle, episodeTitle }))
      .then(() => {
        Alert.alert("Last Watched Updated", `${episodeTitle} has been set as the last watched episode.`);
      })
      .catch((error) => {
        console.error('Error setting last watched:', error);
        Alert.alert("Error", "Failed to update last watched episode. Please try again.");
      });
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#f4511e" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{animeTitle}</Text>
        <View style={styles.rightHeaderPlaceholder} />
      </View>
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
            isSaved={isSaved} 
            category={savedCategory} 
          />
        </View>
      )}

      {batchDownload && (
        <TouchableOpacity style={styles.batchContainer} onPress={handleBatchPress}>
          <Ionicons name="cloud-download-outline" size={24} color="#f4511e" />
          <Text style={styles.batchText}>Download Batch</Text>
        </TouchableOpacity>
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
            isLastWatched={lastWatched[animeTitle] === item.title}
            onLastWatchedPress={handleLastWatchedPress}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.episodeList}
        style={styles.episodeListContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 10,
  },
  rightHeaderPlaceholder: {
    width: 24,
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
  batchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  batchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4511e',
    marginLeft: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
});

export default EpisodeMenuScreen;