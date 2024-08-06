import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { setUsername } from '../redux/userSlice';
import { resetWatchList } from '../redux/animeSlice';

const ProfileSettingsScreen = () => {
  const dispatch = useDispatch();
  const currentUsername = useSelector((state) => state.user.username);
  const [newUsername, setNewUsername] = useState(currentUsername);
  const insets = useSafeAreaInsets();

  const handleSaveUsername = () => {
    if (newUsername.trim() !== '') {
      dispatch(setUsername(newUsername.trim()));
      Alert.alert('Success', 'Username updated successfully');
    } else {
      Alert.alert('Error', 'Username cannot be empty');
    }
  };

  const handleResetWatchList = () => {
    Alert.alert(
      "Reset Watch List",
      "Are you sure you want to reset your entire watch list? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            dispatch(resetWatchList());
            Alert.alert("Watch List Reset", "Your watch list has been reset successfully.");
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Enter new username"
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveUsername}>
          <Text style={styles.saveButtonText}>Save Username</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetWatchList}>
          <Ionicons name="refresh-outline" size={24} color="#fff" />
          <Text style={styles.resetButtonText}>Reset Watch List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -40
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileSettingsScreen;