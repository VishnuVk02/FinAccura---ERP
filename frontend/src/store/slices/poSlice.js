import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orders: [],
    loading: false,
    error: null,
    currentOrder: null,
    notificationCount: 0,
    financeNotificationCount: 0
};

const poSlice = createSlice({
    name: 'po',
    initialState,
    reducers: {
        poRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        createPOSuccess: (state, action) => {
            state.loading = false;
            state.orders.unshift(action.payload);
        },
        fetchOrdersSuccess: (state, action) => {
            state.loading = false;
            state.orders = action.payload;
        },
        fetchOrderByIdSuccess: (state, action) => {
            state.loading = false;
            state.currentOrder = action.payload;
        },
        updateStatusSuccess: (state, action) => {
            state.loading = false;
            const index = state.orders.findIndex(o => o.id === action.payload.id);
            if (index !== -1) {
                state.orders[index] = { ...state.orders[index], status: action.payload.status };
            }
        },
        fetchNotificationCountSuccess: (state, action) => {
            state.notificationCount = action.payload.count;
        },
        fetchFinanceNotificationCountSuccess: (state, action) => {
            state.financeNotificationCount = action.payload.count;
        },
        deletePOSuccess: (state, action) => {
            state.orders = state.orders.filter(order => order.id !== action.payload.id);
            state.loading = false;
        },
        markSeenSuccess: (state) => {
            state.notificationCount = 0;
        },
        markSeenFinanceSuccess: (state) => {
            state.financeNotificationCount = 0;
        },
        poFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {
    poRequest,
    createPOSuccess,
    fetchOrdersSuccess,
    fetchOrderByIdSuccess,
    updateStatusSuccess,
    fetchNotificationCountSuccess,
    fetchFinanceNotificationCountSuccess,
    deletePOSuccess,
    markSeenSuccess,
    markSeenFinanceSuccess,
    poFailure
} = poSlice.actions;

export default poSlice.reducer;
