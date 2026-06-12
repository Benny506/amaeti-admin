import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabase';

export const fetchDeliveryRegions = createAsyncThunk('delivery/fetchRegions', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase
      .from('delivery_regions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const deliverySlice = createSlice({
  name: 'delivery',
  initialState: {
    regions: [],
    loading: false,
    error: null,
  },
  reducers: {
    addRegionLocally: (state, action) => {
      state.regions.unshift(action.payload);
    },
    updateRegionLocally: (state, action) => {
      const index = state.regions.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.regions[index] = action.payload;
      }
    },
    removeRegionLocally: (state, action) => {
      state.regions = state.regions.filter(r => r.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = action.payload;
      })
      .addCase(fetchDeliveryRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addRegionLocally, updateRegionLocally, removeRegionLocally } = deliverySlice.actions;
export default deliverySlice.reducer;
