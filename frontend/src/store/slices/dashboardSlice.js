import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    generalStats: {
        totalRevenue: 0, totalExpense: 0, netProfit: 0,
        pendingInvoices: 0, totalReceived: 0, totalOrders: 0,
        completedOrders: 0, outstandingAmount: 0
    },
    productionStats: null,
    financeStats: null,
    exportStats: null,
    poStats: null,
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        fetchDashboardRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchDashboardSuccess: (state, action) => {
            state.generalStats = action.payload;
            state.loading = false;
        },
        fetchProductionStatsSuccess: (state, action) => {
            state.productionStats = action.payload;
        },
        fetchFinanceStatsSuccess: (state, action) => {
            state.financeStats = action.payload;
        },
        fetchExportStatsSuccess: (state, action) => {
            state.exportStats = action.payload;
        },
        fetchPOStatsSuccess: (state, action) => {
            state.poStats = action.payload;
        },
        dashboardError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    },
});

export const {
    fetchDashboardRequest,
    fetchDashboardSuccess,
    fetchProductionStatsSuccess,
    fetchFinanceStatsSuccess,
    fetchExportStatsSuccess,
    fetchPOStatsSuccess,
    dashboardError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
