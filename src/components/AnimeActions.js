import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SaveAnimeButton = ({ onPress, isSaved, category }) => {
  let iconName = 'bookmark-outline';
  if (isSaved) {
    switch (category) {
      case 'watchList':
        iconName = 'eye-outline';
        break;
      case 'onGoing':
        iconName = 'play-outline';
        break;
      case 'completed':
        iconName = 'checkmark-circle-outline';
        break;
      default:
        iconName = 'bookmark';
    }
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.iconButton}>
      <Ionicons name={iconName} size={24} color="#f4511e" />
    </TouchableOpacity>
  );
};

export const SaveEpisodeButton = ({ onPress, isSaved }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconButton}>
      <Ionicons 
        name={isSaved ? 'checkmark-circle' : 'checkmark-circle-outline'} 
        size={24} 
        color="#f4511e" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 5,
  },
});