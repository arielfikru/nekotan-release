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
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import cheerio from 'cheerio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAnimeList();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.infoButton} 
          onPress={() => navigation.navigate('InfoScreen')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchAnimeList = async (page = 1) => {
    if (page > 2 || animeList.length >= 30) {
      setHasMorePages(false);
      return;
    }

    try {
      const response = await axios.get(`https://otakudesu.cloud/ongoing-anime/page/${page}/`);
      const $ = cheerio.load(response.data);
      
      const newAnimeList = [];
      $('.venz').find('.detpost').each((index, element) => {
        if (animeList.length + newAnimeList.length >= 30) {
          setHasMorePages(false);
          return false; // Break the loop
        }
        const title = $(element).find('.jdlflm').text().trim();
        const image = $(element).find('img').attr('src');
        const url = $(element).find('.thumb > a').attr('href');
        newAnimeList.push({ id: `${page}-${index}-${Date.now()}`, title, image, url });
      });
      
      setAnimeList(prevList => {
        const updatedList = [...prevList, ...newAnimeList];
        if (updatedList.length >= 30) {
          setHasMorePages(false);
        }
        return updatedList.slice(0, 30);
      });
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching anime list:', error);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMorePages && animeList.length < 30) {
      fetchAnimeList(currentPage + 1);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredAnimeList = animeList.filter(anime =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  infoButton: {
    marginRight: 15,
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

export default DashboardScreen;