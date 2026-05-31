import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabase';
import { showSubtleLoader, hideSubtleLoader, showBlockingLoader, hideBlockingLoader, addToast } from './uiSlice';

// Fetch content by slug (e.g. 'home')
// We use a condition to prevent refetching if we already have the data, unless forceRefresh is true
export const fetchSiteContent = createAsyncThunk(
  'content/fetchContent',
  async ({ slug, forceRefresh = false }, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    // If we already have the data and are not forcing a refresh, just return it
    if (state.content.data[slug] && !forceRefresh) {
      return { slug, content: state.content.data[slug] };
    }

    try {
      dispatch(showSubtleLoader('Fetching content...'));
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('page_slug', slug)
        .single();

      if (error) throw error;
      dispatch(hideSubtleLoader());
      return { slug, content: data.content };
    } catch (err) {
      dispatch(hideSubtleLoader());
      dispatch(addToast({ type: 'error', message: 'Failed to fetch content: ' + err.message }));
      return rejectWithValue(err.message);
    }
  }
);

export const saveSiteContent = createAsyncThunk(
  'content/saveContent',
  async ({ slug, content }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showBlockingLoader('Publishing changes...'));
      const { error } = await supabase
        .from('site_content')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('page_slug', slug);

      if (error) throw error;

      dispatch(hideBlockingLoader());
      dispatch(addToast({ type: 'success', message: 'Content published successfully.' }));
      return { slug, content };
    } catch (err) {
      dispatch(hideBlockingLoader());
      dispatch(addToast({ type: 'error', message: 'Failed to publish content: ' + err.message }));
      return rejectWithValue(err.message);
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    data: {}, // { home: { ... }, about: { ... } }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSiteContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiteContent.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.slug] = action.payload.content;
      })
      .addCase(fetchSiteContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save
      .addCase(saveSiteContent.fulfilled, (state, action) => {
        // Sync local redux state immediately on successful save
        state.data[action.payload.slug] = action.payload.content;
      });
  },
});

export default contentSlice.reducer;
