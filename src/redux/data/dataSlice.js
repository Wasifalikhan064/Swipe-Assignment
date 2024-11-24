import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
  products: [],
  customers: [],
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.invoices = action.payload.invoices || []; 
      state.products = action.payload.products || [];
      state.customers = action.payload.customers || [];
    },
  },
});

export const { setData } = dataSlice.actions;
export default dataSlice.reducer;