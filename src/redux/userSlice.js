import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
username: 'NekoTan User',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
      AsyncStorage.setItem('username', action.payload);
    },
  },
});

export const { setUsername } = userSlice.actions;

export const loadUsername = () => async (dispatch) => {
  try {
    const username = await AsyncStorage.getItem('username');
    if (username) {
      dispatch(setUsername(username));
    }
  } catch (error) {
    console.error('Failed to load username:', error);
  }
};

export default userSlice.reducer;