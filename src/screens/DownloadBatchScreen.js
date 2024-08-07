import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Linking, 
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import cheerio from 'cheerio';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DownloadCard = ({ quality, size, links }) => {
  const handleDownload = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{quality} | {size}</Text>
      <View style={styles.linkContainer}>
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.linkButton}
            onPress={() => handleDownload(link.url)}
          >
            <Text style={styles.linkText}>{link.server}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const DownloadBatchScreen = ({ route, navigation }) => {
  const { batchUrl, batchTitle, animeImage } = route.params;
  const [downloadOptions, setDownloadOptions] = useState([]);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchData();
  }, []);

  const fetchBatchData = async () => {
    try {
      const response = await axios.get(batchUrl);
      const $ = cheerio.load(response.data);

      // Parse anime info
      const infoData = {};
      $('.infos').children().each((index, element) => {
        if (element.tagName === 'b') {
          const key = $(element).text().replace(':', '').trim();
          let value = $(element).next().text().trim();
          
          // Special handling for Genres
          if (key === 'Genres') {
            value = [];
            $(element).nextAll('a').each((i, genreElement) => {
              value.push($(genreElement).text().trim());
            });
            value = value.join(', ');
          }
          
          infoData[key] = value;
        }
      });
      setAnimeInfo(infoData);

      // Parse download options
      const downloadOpts = [];
      $('.download').each((index, element) => {
        const $element = $(element);
        const title = $element.find('h4').text();
        if (title.toLowerCase().includes('batch')) {
          $element.find('ul li').each((i, li) => {
            const $li = $(li);
            const qualityText = $li.find('strong').text();
            const size = $li.find('i').text();
            const links = [];
            $li.find('a').each((j, a) => {
              links.push({
                server: $(a).text().trim(),
                url: $(a).attr('href'),
              });
            });
            downloadOpts.push({
              quality: qualityText,
              size: size,
              links: links,
            });
          });
        }
      });

      setDownloadOptions(downloadOpts);
    } catch (error) {
      console.error('Error fetching batch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading batch data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {animeImage && (
            <Image source={{ uri: animeImage }} style={styles.animeImage} />
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {batchTitle}
            </Text>
          </View>
        </View>
        {animeInfo && (
          <View style={styles.animeInfo}>
            <Text style={styles.infoText}>Japanese: {animeInfo.Japanese}</Text>
            <Text style={styles.infoText}>Type: {animeInfo.Type}</Text>
            <Text style={styles.infoText}>Episodes: {animeInfo.Episodes}</Text>
            <Text style={styles.infoText}>Aired: {animeInfo.Aired}</Text>
            <Text style={styles.infoText}>Studios: {animeInfo.Studios}</Text>
            <Text style={styles.infoText}>Rating: {animeInfo.Rating}</Text>
            <Text style={styles.infoText}>Duration: {animeInfo.Duration}</Text>
            <Text style={styles.infoText}>Genres: {animeInfo.Genres}</Text>
          </View>
        )}
        {downloadOptions.map((option, index) => (
          <DownloadCard
            key={index}
            quality={option.quality}
            size={option.size}
            links={option.links}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f4511e',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  animeImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  animeInfo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  linkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  linkButton: {
    backgroundColor: '#f4511e',
    padding: 8,
    borderRadius: 5,
    margin: 3,
  },
  linkText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default DownloadBatchScreen;