import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import cheerio from 'cheerio';

const WatchMenuScreen = ({ route }) => {
  const { episodeUrl, episodeTitle, animeInfo } = route.params;
  const [downloadOptions, setDownloadOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchEpisodeData();
  }, []);

  const fetchEpisodeData = async () => {
    try {
      const response = await axios.get(episodeUrl);
      const $ = cheerio.load(response.data);
      
      const downloadOpts = [];
      $('.download ul li').each((index, element) => {
        const $element = $(element);
        const qualityText = $element.find('strong').text();
        const [format, quality] = qualityText.split(' ');
        const links = [];
        $element.find('a').each((i, el) => {
          links.push({
            server: $(el).text().trim(),
            url: $(el).attr('href')
          });
        });
        const size = $element.find('i').text();
        downloadOpts.push({ format, quality, links, size });
      });
      setDownloadOptions(downloadOpts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching episode data:', error);
      setLoading(false);
    }
  };

  const handleDownloadOptionPress = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening download URL:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading episode data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.episodeInfo}>
          <Image
            source={{ uri: animeInfo?.image || 'https://via.placeholder.com/150' }}
            style={styles.episodeThumbnail}
          />
          <Text style={styles.episodeTitle}>{episodeTitle}</Text>
        </View>
        <View style={styles.downloadSection}>
          <Text style={styles.sectionTitle}>Download Options</Text>
          {downloadOptions.map((option, index) => (
            <View key={index} style={styles.qualitySection}>
              <View style={styles.qualityHeader}>
                <Ionicons name="film-outline" size={24} color="#f4511e" />
                <Text style={styles.qualityTitle}>
                  {option.format} {option.quality} | {option.size}
                </Text>
              </View>
              <View style={styles.downloadLinks}>
                {option.links.map((link, linkIndex) => (
                  <TouchableOpacity
                    key={linkIndex}
                    style={styles.downloadButton}
                    onPress={() => handleDownloadOptionPress(link.url)}
                  >
                    <Ionicons name="cloud-download-outline" size={18} color="#fff" />
                    <Text style={styles.downloadButtonText}>{link.server}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>NekoTan - By NekoNyanDev 2024</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f4511e',
  },
  episodeInfo: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  episodeThumbnail: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  downloadSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  qualitySection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  downloadLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 5,
  },
  downloadButtonText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
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

export default WatchMenuScreen;