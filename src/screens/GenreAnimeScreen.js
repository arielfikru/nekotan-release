import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import cheerio from 'cheerio';
import { Ionicons } from '@expo/vector-icons';

const GenreAnimeScreen = ({ route, navigation }) => {
  const { genre } = route.params;
  const [animeList, setAnimeList] = useState([]);
  const [filteredAnimeList, setFilteredAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAnimeList();
  }, []);

  useEffect(() => {
    const filtered = animeList.filter(anime =>
      anime.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAnimeList(filtered);
  }, [searchQuery, animeList]);

  const fetchAnimeList = async (page = 1) => {
    try {
      const response = await axios.get(`https://otakudesu.cloud/genres/${genre.toLowerCase()}/page/${page}/`);
      const $ = cheerio.load(response.data);
      
      const newAnimeList = [];
      $('.col-anime').each((index, element) => {
        const $element = $(element);
        const title = $element.find('.col-anime-title a').text().trim();
        const image = $element.find('.col-anime-cover img').attr('src');
        const url = $element.find('.col-anime-title a').attr('href');
        newAnimeList.push({ id: `${page}-${index}`, title, image, url });
      });

      if (newAnimeList.length === 0) {
        setHasMorePages(false);
      } else {
        setAnimeList(prevList => [...prevList, ...newAnimeList]);
        setFilteredAnimeList(prevList => [...prevList, ...newAnimeList]);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching anime list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMorePages) {
      fetchAnimeList(currentPage + 1);
    }
  };

  const renderAnimeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EpisodeMenu', { animeUrl: item.url, title: item.title })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search anime..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Ionicons name="search" size={24} color="#f4511e" style={styles.searchIcon} />
      </View>
      <Text style={styles.genreTitle}>{genre} Anime</Text>
      {loading && animeList.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>Loading anime list...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnimeList}
          renderItem={renderAnimeItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.row}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text style={styles.noResultsText}>No anime found</Text>
            </View>
          }
        />
      )}
      <View style={styles.footer}>
        <Text style={styles.footerText}>NekoTan - By NekoNyanDev 2024</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 20,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 10,
  },
  genreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    textAlign: 'center',
    marginVertical: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f4511e',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  flatListContent: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    width: '48%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 10,
  },
  title: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#f4511e',
  },
  footerLoader: {
    marginTop: 10,
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#f4511e',
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default GenreAnimeScreen;