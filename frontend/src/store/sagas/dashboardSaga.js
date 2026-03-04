import { takeLatest, call, put, all, select } from 'redux-saga/effects';
import api from '../../services/api';
import {
    fetchDashboardRequest,
    fetchDashboardSuccess,
    fetchProductionStatsSuccess,
    fetchFinanceStatsSuccess,
    fetchExportStatsSuccess,
    fetchPOStatsSuccess,
    dashboardError
} from '../slices/dashboardSlice';

const getUser = (state) => state.auth.user;

function* handleFetchDashboard() {
    try {
        const user = yield select(getUser);
        const statsRes = yield call(api.get, '/dashboard/stats');
        yield put(fetchDashboardSuccess(statsRes.data));

        if (['ADMIN', 'PRODUCTION_MANAGER'].includes(user?.role)) {
            try {
                const prodRes = yield call(api.get, '/production/stats');
                yield put(fetchProductionStatsSuccess({
                    summary: prodRes.data.summary,
                    lineEfficiency: prodRes.data.lineEfficiency,
                    productionTrend: prodRes.data.productionTrend,
                    defectStats: prodRes.data.defectStats
                }));
            } catch (e) { console.log('Production stats not available'); }
        }

        if (['ADMIN', 'FINANCE_MANAGER'].includes(user?.role)) {
            try {
                const finRes = yield call(api.get, '/dashboard/finance-stats');
                yield put(fetchFinanceStatsSuccess(finRes.data));
            } catch (e) { console.log('Finance stats not available'); }
        }

        if (['ADMIN', 'EXPORT_MANAGER'].includes(user?.role)) {
            try {
                const expRes = yield call(api.get, '/dashboard/export-stats');
                yield put(fetchExportStatsSuccess(expRes.data));
            } catch (e) { console.log('Export stats not available'); }
        }

        if (['ADMIN', 'PO_MANAGER'].includes(user?.role)) {
            try {
                const poRes = yield call(api.get, '/dashboard/po-stats');
                yield put(fetchPOStatsSuccess(poRes.data));
            } catch (e) { console.log('PO stats not available'); }
        }
    } catch (error) {
        yield put(dashboardError(error.response?.data?.message || 'Failed to fetch dashboard data'));
    }
}

export default function* dashboardSaga() {
    yield all([
        takeLatest(fetchDashboardRequest.type, handleFetchDashboard)
    ]);
}
