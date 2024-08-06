import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const InfoScreen = () => {
  const appVersion = "1.1.7";
  const githubLink = "https://github.com/arielfikru/nekotan-release";

  const openGithubLink = () => {
    Linking.openURL(githubLink);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>NekoTan - Nonton Anime</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
        
        <TouchableOpacity style={styles.updateButton} onPress={openGithubLink}>
          <Ionicons name="logo-github" size={24} color="#fff" />
          <Text style={styles.updateButtonText}>Check for Updates on GitHub</Text>
        </TouchableOpacity>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            NekoTan is developed and maintained by the Nekotan community and NekoNyanDev.
          </Text>
          <Text style={styles.infoText}>
            Our goal is to provide a seamless anime watching experience for all fans.
          </Text>
        </View>
        
        <View style={styles.creditSection}>
          <Text style={styles.creditTitle}>Credits:</Text>
          <Text style={styles.creditText}>• Nekotan Community</Text>
          <Text style={styles.creditText}>• NekoNyanDev Team</Text>
        </View>
      </View>
      
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
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 10,
  },
  version: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 30,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  creditSection: {
    alignItems: 'center',
  },
  creditTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 10,
  },
  creditText: {
    fontSize: 16,
    color: '#333',
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

export default InfoScreen;