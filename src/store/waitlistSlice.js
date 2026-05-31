import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabase';
import { showSubtleLoader, hideSubtleLoader, addToast } from './uiSlice';

export const fetchWaitlistData = createAsyncThunk(
  'waitlist/fetchData',
  async ({ page = 1, pageSize = 15 }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showSubtleLoader('Syncing Waitlist...'));
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('email_waitlist')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      dispatch(hideSubtleLoader());
      return { data, count, page, pageSize };
    } catch (err) {
      dispatch(hideSubtleLoader());
      dispatch(addToast({ type: 'error', message: 'Failed to fetch waitlist: ' + err.message }));
      return rejectWithValue(err.message);
    }
  }
);

const waitlistSlice = createSlice({
  name: 'waitlist',
  initialState: {
    data: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 15,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWaitlistData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWaitlistData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.totalCount = action.payload.count;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchWaitlistData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default waitlistSlice.reducer;
