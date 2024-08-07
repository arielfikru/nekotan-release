import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import cheerio from 'cheerio';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;

    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(searchQuery.replace(/\s+/g, '+'));
      const url = `https://otakudesu.cloud/?s=${encodedQuery}&post_type=anime`;
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const results = [];
      $('.chivsrc li').each((index, element) => {
        const $element = $(element);
        const title = $element.find('h2 a').text().trim();
        const url = $element.find('h2 a').attr('href');
        const image = $element.find('img').attr('src');
        const genres = $element.find('.set:contains("Genres")').text().replace('Genres :', '').trim();
        const status = $element.find('.set:contains("Status")').text().replace('Status :', '').trim();
        const rating = $element.find('.set:contains("Rating")').text().replace('Rating :', '').trim();

        results.push({ title, url, image, genres, status, rating });
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAnimeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EpisodeMenu', { animeUrl: item.url, title: item.title })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
        <Text style={styles.info}>Status: {item.status}</Text>
        <Text style={styles.info}>Rating: {item.rating}</Text>
        <Text style={styles.genres} numberOfLines={1} ellipsizeMode="tail">{item.genres}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleGenreListPress = () => {
    navigation.navigate('GenreList');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search anime..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Ionicons name="search" size={24} color="#f4511e" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.genreButton} onPress={handleGenreListPress}>
            <Ionicons name="list" size={24} color="#f4511e" />
            <Text style={styles.genreButtonText}>Genres</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#f4511e" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderAnimeItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <View style={styles.centerContent}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.noResultsText}>Search for your favorite anime</Text>
          </View>
        )}
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>NekoTan - By NekoNyanDev 2024</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f4511e',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  genreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  genreButtonText: {
    marginLeft: 5,
    color: '#f4511e',
    fontWeight: 'bold',
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
  resultsList: {
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 100,
    height: 150,
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: '#666',
  },
  genres: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontSize: 16,
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

export default SearchScreen;