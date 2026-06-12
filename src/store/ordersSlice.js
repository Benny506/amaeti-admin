import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabase';

export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrdersAsync',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      // Get total count
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Fetch paginated orders
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_code, total_amount, status, created_at, contact_info,
          user_profiles:user_id ( username )
        `)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.log(error)
        throw error
      };

      return {
        orders: data,
        totalCount: count || 0,
        currentPage: page
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  totalCount: 0,
  currentPage: 1,
  ordersPerPage: 10,
  status: 'idle',
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    updateOrderStatusLocally: (state, action) => {
      const { id, status, tracking_link, tracking_id, tracking_notes } = action.payload;
      const order = state.items.find(o => o.id === id);
      if (order) {
        if (status !== undefined) order.status = status;
        if (tracking_link !== undefined) order.tracking_link = tracking_link;
        if (tracking_id !== undefined) order.tracking_id = tracking_id;
        if (tracking_notes !== undefined) order.tracking_notes = tracking_notes;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.orders;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { setPage, updateOrderStatusLocally } = ordersSlice.actions;

export default ordersSlice.reducer;
