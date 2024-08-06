import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const QualitySelector = ({ selectedQuality, onQualityChange }) => {
  const qualities = ['360p', '480p', '720p'];

  return (
    <View style={styles.qualityButtons}>
      {qualities.map(quality => (
        <TouchableOpacity
          key={quality}
          style={[styles.qualityButton, selectedQuality === quality && styles.selectedQualityButton]}
          onPress={() => onQualityChange(quality)}
        >
          <Text style={[styles.qualityButtonText, selectedQuality === quality && styles.selectedQualityButtonText]}>
            {quality}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  qualityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  selectedQualityButton: {
    backgroundColor: '#f4511e',
  },
  qualityButtonText: {
    color: '#fff',
  },
  selectedQualityButtonText: {
    color: '#fff',
  },
});

export default QualitySelector;