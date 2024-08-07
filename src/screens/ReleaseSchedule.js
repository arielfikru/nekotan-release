import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import cheerio from 'cheerio';
import { useNavigation } from '@react-navigation/native';

const ReleaseSchedule = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentDay = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get('https://otakudesu.cloud/jadwal-rilis/');
      const html = response.data;
      const $ = cheerio.load(html);
      
      const scheduleData = {};

      $('.kglist321').each((index, element) => {
        const day = $(element).find('h2').text().trim();
        const animes = [];

        $(element).find('ul li a').each((i, el) => {
          animes.push({
            title: $(el).text().trim(),
            url: $(el).attr('href'),
          });
        });

        scheduleData[day] = animes;
      });

      setSchedule(scheduleData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setLoading(false);
    }
  };

  const handleAnimePress = (url, title) => {
    navigation.navigate('EpisodeMenu', { animeUrl: url, title: title });
  };

  const dayMapping = {
    0: 'Minggu',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu'
  };

  const renderScheduleItem = (day, animes) => {
    const isCurrentDay = day === dayMapping[currentDay];
    return (
      <View key={day} style={styles.dayContainer}>
        <View style={styles.dayTitleContainer}>
          <Text style={styles.dayTitle}>{day}</Text>
          {isCurrentDay && (
            <Text style={styles.todayIndicator}>HARI INI</Text>
          )}
        </View>
        {animes.map((anime, index) => (
          <TouchableOpacity
            key={index}
            style={styles.animeItem}
            onPress={() => handleAnimePress(anime.url, anime.title)}
          >
            <Text style={styles.animeTitle}>{anime.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  // Mengurutkan hari sesuai dengan urutan dalam seminggu, dimulai dari hari ini
  const orderedDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Random'];
  const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1; // Adjust for Sunday
  const reorderedDays = [
    ...orderedDays.slice(currentDayIndex, -1),
    ...orderedDays.slice(0, currentDayIndex),
    'Random'
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Jadwal Rilis Anime</Text>
      {reorderedDays.map(day => renderScheduleItem(day, schedule[day] || []))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#f4511e',
    marginVertical: 20,
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
  dayContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  todayIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  animeItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  animeTitle: {
    fontSize: 16,
    color: '#333',
  },
});

export default ReleaseSchedule;