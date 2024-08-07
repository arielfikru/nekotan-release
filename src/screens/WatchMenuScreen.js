import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import cheerio from 'cheerio';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import VideoPlayer from './WatchMenu/VideoPlayer';
import QualitySelector from './WatchMenu/QualitySelector';
import DownloadOptions from './WatchMenu/DownloadOptions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WatchMenuScreen = ({ route, navigation }) => {
  const { episodeUrl, episodeTitle, animeInfo } = route.params;
  const [downloadOptions, setDownloadOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('480p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeServer, setActiveServer] = useState(null);
  const [availableServers, setAvailableServers] = useState([]);
  const [isMegaVideo, setIsMegaVideo] = useState(false);
  const [showMegaControls, setShowMegaControls] = useState(false);
  const webViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchEpisodeData();
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: !isFullscreen,
    });
  }, [isFullscreen, navigation]);

  const fetchEpisodeData = async () => {
    try {
      const response = await axios.get(episodeUrl);
      const $ = cheerio.load(response.data);

      const downloadOpts = [];
      $('.download ul li').each((index, element) => {
        const $element = $(element);
        const qualityText = $element.find('strong').text();
        const quality = qualityText.trim();
        const links = [];
        $element.find('a').each((i, el) => {
          links.push({
            server: $(el).text().trim(),
            url: $(el).attr('href'),
          });
        });
        const size = $element.find('i').text();
        downloadOpts.push({ quality, links, size });
      });
      setDownloadOptions(downloadOpts);

      console.log('Download Options:', JSON.stringify(downloadOpts, null, 2));

      const servers = [];
      if (downloadOpts.some(opt => opt.links.some(link => link.server.toLowerCase() === 'pdrain'))) {
        servers.push('pdrain');
      }
      if (downloadOpts.some(opt => opt.links.some(link => link.server.toLowerCase() === 'mega'))) {
        servers.push('mega');
      }
      setAvailableServers(servers);

      console.log('Available Servers:', servers);

      if (servers.length > 0) {
        setActiveServer(servers[0]);
        await setStreamingUrlForQuality('480p', downloadOpts, servers[0]);
      } else {
        console.log('No supported streaming servers found');
        setStreamingUrl(null);
      }
    } catch (error) {
      console.error('Error fetching episode data:', error);
    } finally {
      setLoading(false);
    }
  };

  const followRedirectToPdrain = async (url) => {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const secureUrl = $('meta[property="og:video:secure_url"]').attr('content');
      console.log('PDrain Secure URL:', secureUrl);
      if (secureUrl && secureUrl.includes('pixeldrain.com/api/file')) {
        return secureUrl;
      }
      throw new Error('Secure URL not found in redirect page');
    } catch (error) {
      console.error('Error following redirect to PDrain:', error);
      return null;
    }
  };

  const followRedirectToMega = async (url) => {
    try {
      const response = await axios.get(url, {
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
      });
      
      let finalUrl = '';
      if (response.request && response.request.res && response.request.res.responseUrl) {
        finalUrl = response.request.res.responseUrl;
      } else if (response.request && response.request.responseURL) {
        finalUrl = response.request.responseURL;
      } else {
        finalUrl = response.config.url;
      }

      console.log('Mega Final URL:', finalUrl);
      
      if (finalUrl && finalUrl.includes('mega.nz/file/')) {
        const uid = finalUrl.split('/').pop();
        const embedUrl = `https://mega.nz/embed/${uid}`;
        console.log('Mega Embed URL:', embedUrl);
        return embedUrl;
      }
      throw new Error('Mega URL not found in redirect page');
    } catch (error) {
      console.error('Error following redirect to Mega:', error);
      return null;
    }
  };

  const setStreamingUrlForQuality = async (quality, options = downloadOptions, server = activeServer) => {
    console.log('Setting streaming URL for quality:', quality, 'server:', server);
    const option = options.find(opt => opt.quality.includes(quality));
    if (option) {
      const serverLink = option.links.find(link => link.server.toLowerCase() === server);
      if (serverLink) {
        try {
          let finalUrl;
          if (server === 'pdrain') {
            finalUrl = await followRedirectToPdrain(serverLink.url);
            setIsMegaVideo(false);
          } else if (server === 'mega') {
            finalUrl = await followRedirectToMega(serverLink.url);
            setIsMegaVideo(true);
          }
          if (finalUrl) {
            console.log('Final streaming URL:', finalUrl);
            setStreamingUrl(finalUrl);
            setSelectedQuality(quality);
          } else {
            throw new Error(`Failed to get final ${server.toUpperCase()} URL`);
          }
        } catch (error) {
          console.error('Error setting streaming URL:', error);
          setStreamingUrl(null);
        }
      } else {
        console.log('Server link not found for:', server);
        setStreamingUrl(null);
      }
    } else {
      console.log('Quality option not found for:', quality);
      setStreamingUrl(null);
    }
    setLoading(false);
  };

  const handleQualityChange = async (quality) => {
    setLoading(true);
    await setStreamingUrlForQuality(quality);
  };

  const handleServerChange = async () => {
    if (availableServers.length > 1) {
      const newServer = activeServer === 'pdrain' ? 'mega' : 'pdrain';
      setActiveServer(newServer);
      setLoading(true);
      await setStreamingUrlForQuality(selectedQuality, downloadOptions, newServer);
    }
  };

  const handleFullscreenChange = (fullscreen) => {
    setIsFullscreen(fullscreen);
    navigation.setOptions({
      headerShown: !fullscreen,
    });
  };

  const handleWebViewNavigation = (navState) => {
    if (isMegaVideo && navState.url.includes('mega.nz/file/')) {
      webViewRef.current.stopLoading();
      setShowMegaControls(true);
      setTimeout(() => setShowMegaControls(false), 3000);
      return false;
    }
    return true;
  };

  const MegaPlayer = () => (
    <View style={styles.megaPlayerContainer}>
      <WebView
        ref={webViewRef}
        source={{ uri: streamingUrl }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        onNavigationStateChange={handleWebViewNavigation}
      />
      {showMegaControls && (
        <View style={styles.megaControls}>
          <TouchableOpacity onPress={() => webViewRef.current.reload()} style={styles.controlButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)} style={styles.controlButton}>
            <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Memuat data episode...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: isFullscreen ? 0 : insets.top }]}>
      {streamingUrl ? (
        isMegaVideo ? (
          <MegaPlayer />
        ) : (
          <VideoPlayer 
            streamingUrl={streamingUrl} 
            onFullscreenChange={handleFullscreenChange}
          />
        )
      ) : (
        <View style={styles.noStreamingContainer}>
          <Text style={styles.noStreamingText}>Maaf, Anime ini tidak Support Streaming untuk saat ini</Text>
        </View>
      )}
      {!isFullscreen && (
        <>
          <View style={styles.controlsContainer}>
            <QualitySelector 
              selectedQuality={selectedQuality} 
              onQualityChange={handleQualityChange}
              qualities={downloadOptions.map(opt => opt.quality)}
            />
            {availableServers.length > 1 && (
              <TouchableOpacity style={styles.serverButton} onPress={handleServerChange}>
                <Ionicons name="swap-horizontal" size={24} color="#f4511e" />
                <Text style={styles.serverButtonText}>{activeServer.toUpperCase()}</Text>
              </TouchableOpacity>
            )}
          </View>
          {isMegaVideo && (
            <View style={styles.megaInstructionContainer}>
              <Text style={styles.megaInstructionText}>
                Tekan judul video di atas untuk memunculkan kontrol video
              </Text>
            </View>
          )}
          <DownloadOptions downloadOptions={downloadOptions} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>NekoTan - By NekoNyanDev 2024</Text>
          </View>
        </>
      )}
    </View>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f4511e',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  serverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  serverButtonText: {
    marginLeft: 5,
    color: '#f4511e',
    fontWeight: 'bold',
  },
  noStreamingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noStreamingText: {
    fontSize: 16,
    color: '#f4511e',
    textAlign: 'center',
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
  megaPlayerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9/16),
  },
  webView: {
    flex: 1,
  },
  megaControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  controlButton: {
    padding: 5,
  },
  megaInstructionContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  megaInstructionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default WatchMenuScreen;