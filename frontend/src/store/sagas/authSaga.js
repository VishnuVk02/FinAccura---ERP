import { takeLatest, call, put, all } from 'redux-saga/effects';
import api from '../../services/api';
import {
    loginRequest,
    loginSuccess,
    loginFailure,
    logout,
    setProfile,
    setLoading,
    initializeAuth
} from '../slices/authSlice';

function* handleLogin(action) {
    try {
        const { email, password } = action.payload;
        console.log('[AUTH SAGA] Attempting login for:', email);
        const response = yield call([api, api.post], '/auth/login', { email, password });

        // Handle both standard axios response and data-only responses
        const responseData = response.data || response;
        const { token, ...user } = responseData;

        if (!token) {
            console.error('[AUTH SAGA] Token missing in response!');
            throw new Error('Token missing in server response');
        }

        localStorage.setItem('token', token);
        console.log('[AUTH SAGA] Login successful, token stored');
        yield put(loginSuccess({ user, token }));
    } catch (error) {
        console.error('[AUTH SAGA] Login error:', error);
        yield put(loginFailure(error.response?.data?.message || error.message || 'Login failed'));
    }
}

function* handleFetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        yield put(setLoading(false));
        return;
    }
    try {
        const response = yield call(api.get, '/auth/profile');
        yield put(setProfile(response.data));
    } catch (error) {
        localStorage.removeItem('token');
        yield put(setLoading(false));
    }
}

function* handleLogout() {
    localStorage.removeItem('token');
}

export default function* authSaga() {
    yield all([
        takeLatest(loginRequest.type, handleLogin),
        takeLatest(initializeAuth.type, handleFetchProfile),
        takeLatest(logout.type, handleLogout)
    ]);
}
