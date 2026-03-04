import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import productionSaga from './productionSaga';
import dashboardSaga from './dashboardSaga';
import poSaga from './poSaga';

export default function* rootSaga() {
    yield all([
        authSaga(),
        productionSaga(),
        dashboardSaga(),
        poSaga(),
    ]);
}
