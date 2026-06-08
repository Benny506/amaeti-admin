import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabase';
import { showSubtleLoader, hideSubtleLoader, addToast } from './uiSlice';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, limit = 20 }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showSubtleLoader('Loading products...'));
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select('*, categories(title), product_variants(price, inventory_quantity)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        items: data,
        totalCount: count,
        page,
        hasMore: to < count - 1
      };
    } catch (error) {
      dispatch(addToast({ type: 'error', message: 'Failed to load products.' }));
      return rejectWithValue(error.message);
    } finally {
      dispatch(hideSubtleLoader());
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showSubtleLoader('Loading categories...'));
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: 'Failed to load categories.' }));
      return rejectWithValue(error.message);
    } finally {
      dispatch(hideSubtleLoader());
    }
  }
);

export const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    totalCount: 0,
    page: 1,
    hasMore: true,
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.items = action.payload.items;
        } else {
          const newItems = action.payload.items.filter(
            newItem => !state.items.some(existing => existing.id === newItem.id)
          );
          state.items = [...state.items, ...newItems];
        }
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  }
});

export default productsSlice.reducer;
