import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const genres = [
  "Action", "Adventure", "Comedy", "Demons", "Drama", "Ecchi", "Fantasy", "Game",
  "Harem", "Historical", "Horror", "Josei", "Magic", "Martial Arts", "Mecha",
  "Military", "Music", "Mystery", "Psychological", "Parody", "Police", "Romance",
  "Samurai", "School", "Sci-Fi", "Seinen", "Shoujo", "Shoujo Ai", "Shounen",
  "Slice of Life", "Sports", "Space", "Super Power", "Supernatural", "Thriller", "Vampire"
];

const GenreCard = ({ genre, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.genreText}>{genre}</Text>
    <Ionicons name="chevron-forward" size={24} color="#f4511e" />
  </TouchableOpacity>
);

const GenreListScreen = ({ navigation }) => {
  const handleGenrePress = (genre) => {
    navigation.navigate('GenreAnime', { genre });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Anime Genres</Text>
      <FlatList
        data={genres}
        renderItem={({ item }) => (
          <GenreCard genre={item} onPress={() => handleGenrePress(item)} />
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  genreText: {
    fontSize: 18,
    color: '#333',
  },
});

export default GenreListScreen;