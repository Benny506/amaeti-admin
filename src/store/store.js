import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import authReducer from './authSlice';
import waitlistReducer from './waitlistSlice';
import contentReducer from './contentSlice';
import productsReducer from './productsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    waitlist: waitlistReducer,
    content: contentReducer,
    products: productsReducer,
  },
});
