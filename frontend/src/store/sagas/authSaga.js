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
        const response = yield call(api.post, '/auth/login', { email, password });
        const { token, ...user } = response.data;
        localStorage.setItem('token', token);
        yield put(loginSuccess({ user, token }));
    } catch (error) {
        console.error('[LOGIN SAGA ERROR]', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
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
