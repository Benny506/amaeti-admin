import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabase';

export const authBootstrapper = createAsyncThunk(
  'auth/bootstrapper',
  async (user, { rejectWithValue }) => {
    try {
      if (!user || !user.id) throw new Error("No user provided");
      
      const { data: profile, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error || !profile) {
        throw new Error("Admin profile not found");
      }
      
      return { user, profile };
    } catch (error) {
      // Fail-safe: actively log the user out of Supabase if the bootstrapper fails
      await supabase.auth.signOut();
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    isInitializing: true,
  },
  reducers: {
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(authBootstrapper.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isInitializing = false;
      })
      .addCase(authBootstrapper.rejected, (state) => {
        state.user = null;
        state.profile = null;
        state.isInitializing = false;
      });
  }
});

export const { setInitializing, clearAuth } = authSlice.actions;
export default authSlice.reducer;
