import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allocations: [],
    lines: [],
    orders: [],
    reportsForDate: [],
    currentAllocation: null,
    loading: false,
    error: null,
};

const productionSlice = createSlice({
    name: 'production',
    initialState,
    reducers: {
        fetchProductionDataRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchProductionDataSuccess: (state, action) => {
            const { allocations, lines } = action.payload;
            state.allocations = allocations;
            state.lines = lines;
            state.loading = false;
        },
        fetchOrdersRequest: (state) => {
            state.loading = true;
        },
        fetchOrdersSuccess: (state, action) => {
            state.orders = action.payload;
            state.loading = false;
        },
        productionError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        saveAllocationRequest: (state) => {
            state.loading = true;
        },
        saveDailyEntryRequest: (state) => {
            state.loading = true;
        },
        saveSuccess: (state) => {
            state.loading = false;
        },
        fetchAllocationRequest: (state) => {
            state.loading = true;
        },
        fetchAllocationSuccess: (state, action) => {
            state.currentAllocation = action.payload;
            state.loading = false;
        },
        fetchReportsByDateRequest: (state) => {
            state.loading = true;
        },
        fetchReportsByDateSuccess: (state, action) => {
            state.reportsForDate = action.payload;
            state.loading = false;
        },
    },
});

export const {
    fetchProductionDataRequest,
    fetchProductionDataSuccess,
    fetchOrdersRequest,
    fetchOrdersSuccess,
    productionError,
    saveAllocationRequest,
    saveDailyEntryRequest,
    saveSuccess,
    fetchAllocationRequest,
    fetchAllocationSuccess,
    fetchReportsByDateRequest,
    fetchReportsByDateSuccess
} = productionSlice.actions;

export default productionSlice.reducer;
