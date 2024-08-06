import { configureStore } from '@reduxjs/toolkit';
import animeReducer from './animeSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    anime: animeReducer,
    user: userReducer,
  },
});