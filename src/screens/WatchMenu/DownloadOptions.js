import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DownloadOptions = ({ downloadOptions }) => {
  const handleDownload = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.scrollView}>
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
                  onPress={() => handleDownload(link.url)}
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
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
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
});

export default DownloadOptions;