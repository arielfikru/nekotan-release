import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  savedAnimes: {},
  lastWatched: {},
};

export const loadAnimeData = createAsyncThunk(
  'anime/loadAnimeData',
  async () => {
    const savedAnimesData = await AsyncStorage.getItem('savedAnimes');
    const lastWatchedData = await AsyncStorage.getItem('lastWatched');
    return {
      savedAnimes: savedAnimesData ? JSON.parse(savedAnimesData) : {},
      lastWatched: lastWatchedData ? JSON.parse(lastWatchedData) : {},
    };
  }
);

export const saveAnime = createAsyncThunk(
  'anime/saveAnime',
  async (animeData, { getState }) => {
    const { savedAnimes } = getState().anime;
    const updatedSavedAnimes = {
      ...savedAnimes,
      [animeData.animeId]: animeData
    };
    await AsyncStorage.setItem('savedAnimes', JSON.stringify(updatedSavedAnimes));
    return updatedSavedAnimes;
  }
);

export const removeAnime = createAsyncThunk(
  'anime/removeAnime',
  async (animeId, { getState }) => {
    const { savedAnimes } = getState().anime;
    const updatedSavedAnimes = { ...savedAnimes };
    delete updatedSavedAnimes[animeId];
    await AsyncStorage.setItem('savedAnimes', JSON.stringify(updatedSavedAnimes));
    return updatedSavedAnimes;
  }
);

export const setLastWatched = createAsyncThunk(
  'anime/setLastWatched',
  async ({ animeId, episodeTitle }, { getState }) => {
    const { lastWatched } = getState().anime;
    const updatedLastWatched = {
      ...lastWatched,
      [animeId]: episodeTitle
    };
    await AsyncStorage.setItem('lastWatched', JSON.stringify(updatedLastWatched));
    return updatedLastWatched;
  }
);

export const resetWatchList = createAsyncThunk(
  'anime/resetWatchList',
  async () => {
    await AsyncStorage.removeItem('savedAnimes');
    return {};
  }
);

const animeSlice = createSlice({
  name: 'anime',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAnimeData.fulfilled, (state, action) => {
        state.savedAnimes = action.payload.savedAnimes;
        state.lastWatched = action.payload.lastWatched;
      })
      .addCase(saveAnime.fulfilled, (state, action) => {
        state.savedAnimes = action.payload;
      })
      .addCase(removeAnime.fulfilled, (state, action) => {
        state.savedAnimes = action.payload;
      })
      .addCase(setLastWatched.fulfilled, (state, action) => {
        state.lastWatched = action.payload;
      })
      .addCase(resetWatchList.fulfilled, (state, action) => {
        state.savedAnimes = action.payload;
      });
  },
});

export default animeSlice.reducer;