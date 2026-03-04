import { takeLatest, call, put, all } from 'redux-saga/effects';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    fetchProductionDataRequest,
    fetchProductionDataSuccess,
    fetchOrdersRequest,
    fetchOrdersSuccess,
    fetchAllocationRequest,
    productionError,
    saveAllocationRequest,
    saveDailyEntryRequest,
    saveSuccess,
    fetchAllocationSuccess,
    fetchReportsByDateRequest,
    fetchReportsByDateSuccess
} from '../slices/productionSlice';

function* handleFetchProductionData() {
    try {
        const [allocRes, linesRes] = yield all([
            call(api.get, '/production/worker-allocation'),
            call(api.get, '/production/production-lines')
        ]);
        yield put(fetchProductionDataSuccess({
            allocations: allocRes.data,
            lines: linesRes.data
        }));
    } catch (error) {
        yield put(productionError(error.response?.data?.message || 'Failed to fetch production data'));
        toast.error('Failed to fetch production data');
    }
}

function* handleFetchOrders() {
    try {
        const response = yield call(api.get, '/production/production-orders');
        yield put(fetchOrdersSuccess(response.data));
    } catch (error) {
        yield put(productionError(error.response?.data?.message || 'Failed to fetch orders'));
    }
}

function* handleSaveAllocation(action) {
    try {
        yield call(api.post, '/production/worker-allocation', action.payload);
        yield put(saveSuccess());
        toast.success('Worker allocation saved');
        yield put(fetchProductionDataRequest());
    } catch (error) {
        yield put(productionError(error.response?.data?.message || 'Failed to save allocation'));
        toast.error(error.response?.data?.message || 'Failed to save allocation');
    }
}

function* handleSaveDailyEntry(action) {
    try {
        yield call(api.post, '/production/daily-production', action.payload);
        yield put(saveSuccess());
        toast.success('Daily production record saved');
        yield put(fetchOrdersRequest()); // Refresh orders to update progress
        if (action.payload.productionDate) {
            yield put(fetchReportsByDateRequest(action.payload.productionDate));
        }
    } catch (error) {
        yield put(productionError(error.response?.data?.message || 'Failed to save record'));
        toast.error(error.response?.data?.message || 'Failed to save record');
    }
}

function* handleFetchAllocation(action) {
    try {
        const { lineId, date } = action.payload;
        const response = yield call(api.get, `/production/worker-allocation?lineId=${lineId}&date=${date}`);
        const alloc = response.data.find(a => a.lineId == lineId && a.allocationDate === date);
        yield put(fetchAllocationSuccess(alloc || null));
    } catch (error) {
        yield put(productionError(error.response?.data?.message || 'Failed to fetch allocation'));
    }
}

function* handleFetchReportsByDate(action) {
    try {
        const response = yield call(api.get, `/production/daily-reports?date=${action.payload}`);
        yield put(fetchReportsByDateSuccess(response.data));
    } catch (error) {
        yield put(productionError(error.response?.data?.message || 'Failed to fetch reports'));
    }
}

export default function* productionSaga() {
    yield all([
        takeLatest(fetchProductionDataRequest.type, handleFetchProductionData),
        takeLatest(fetchOrdersRequest.type, handleFetchOrders),
        takeLatest(saveAllocationRequest.type, handleSaveAllocation),
        takeLatest(saveDailyEntryRequest.type, handleSaveDailyEntry),
        takeLatest(fetchAllocationRequest.type, handleFetchAllocation),
        takeLatest(fetchReportsByDateRequest.type, handleFetchReportsByDate)
    ]);
}
