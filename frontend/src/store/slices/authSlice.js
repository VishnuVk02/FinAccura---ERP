import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        loginRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.loading = false;
            localStorage.removeItem('token');
        },
        setProfile: (state, action) => {
            state.user = action.payload;
            state.loading = false;
        },
        initializeAuth: (state) => {
            state.loading = true;
        },
        authError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    },
});

export const {
    setLoading,
    loginRequest,
    loginSuccess,
    loginFailure,
    logout,
    setProfile,
    initializeAuth,
    authError
} = authSlice.actions;

export default authSlice.reducer;
