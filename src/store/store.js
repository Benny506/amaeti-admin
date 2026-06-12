import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import waitlistReducer from './waitlistSlice';
import contentReducer from './contentSlice';
import productsReducer from './productsSlice';
import deliveryReducer from './deliverySlice';
import ordersReducer from './ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    waitlist: waitlistReducer,
    content: contentReducer,
    products: productsReducer,
    delivery: deliveryReducer,
    orders: ordersReducer,
  },
});
