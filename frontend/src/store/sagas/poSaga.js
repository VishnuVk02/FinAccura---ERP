import { takeLatest, put, call, all } from 'redux-saga/effects';
import api from '../../services/api';
import {
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
} from '../slices/poSlice';
import { fetchOrdersRequest } from '../slices/productionSlice';
import { toast } from 'react-hot-toast';

function* createPO(action) {
    try {
        const response = yield call(api.post, '/po/create', action.payload);
        yield put(createPOSuccess(response.data));
        toast.success('Purchase Order created successfully!');
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to create PO'));
    }
}

function* fetchMyOrders() {
    try {
        const response = yield call(api.get, '/po/my-orders');
        yield put(fetchOrdersSuccess(response.data));
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to fetch orders'));
    }
}

function* fetchOrderById(action) {
    try {
        const response = yield call(api.get, `/po/${action.payload}`);
        yield put(fetchOrderByIdSuccess(response.data));
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to fetch order detail'));
    }
}

// Department specific fetches (helper for other modules)
function* fetchProductionOrders() {
    try {
        const response = yield call(api.get, '/production/orders');
        yield put(fetchOrdersSuccess(response.data));
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to fetch production orders'));
    }
}

function* fetchExportReadyOrders() {
    try {
        const response = yield call(api.get, '/export/orders-ready');
        yield put(fetchOrdersSuccess(response.data));
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to fetch ready orders'));
    }
}

function* fetchFinanceOrders() {
    try {
        const response = yield call(api.get, '/finance/orders');
        yield put(fetchOrdersSuccess(response.data));
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to fetch finance orders'));
    }
}

function* updatePOStatus(action) {
    try {
        const { id, status, department } = action.payload;
        let endpoint = `/po/update-status/${id}`;
        if (department === 'PRODUCTION') endpoint = `/production/update-status/${id}`;
        else if (department === 'EXPORT') endpoint = `/export/update-status/${id}`;
        else if (department === 'FINANCE') endpoint = `/finance/update-payment-status/${id}`;

        const response = yield call(api.put, endpoint, { status });
        yield put(updateStatusSuccess(response.data));
        toast.success(`Status updated to ${status}`);
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to update status'));
    }
}

function* fetchNotificationCount() {
    try {
        const response = yield call(api.get, '/po/notification-count');
        yield put(fetchNotificationCountSuccess(response.data));
    } catch (error) {
        console.error('Failed to fetch notifications', error);
    }
}

function* startProduction(action) {
    try {
        const { id, lineId, assignedDate, targetQuantity } = action.payload;
        console.log('Saga startProduction Payload:', action.payload);
        const response = yield call(api.post, `/po/start-production/${id}`, { lineId, assignedDate, targetQuantity });
        yield put(updateStatusSuccess(response.data.po));
        yield put(fetchOrdersRequest()); // Refresh production summary
        toast.success('Production started and line assigned!');
    } catch (error) {
        console.error('Start Production API Error:', error.response?.data);
        yield put(poFailure(error.response?.data?.message || 'Failed to start production'));
        toast.error(error.response?.data?.message || 'Failed to start production');
    }
}

function* deletePO(action) {
    try {
        const id = action.payload;
        yield call(api.delete, `/po/${id}`);
        yield put(deletePOSuccess({ id }));
        toast.success('Purchase Order deleted successfully');
    } catch (error) {
        yield put(poFailure(error.response?.data?.message || 'Failed to delete PO'));
    }
}

function* markSeenByProduction() {
    try {
        yield call(api.put, '/po/mark-seen-production');
        yield put(markSeenSuccess());
    } catch (error) {
        console.error('Failed to mark as seen', error);
    }
}

function* fetchFinanceNotificationCount() {
    try {
        const res = yield call(api.get, '/po/finance-notification-count');
        yield put(fetchFinanceNotificationCountSuccess(res.data));
    } catch (e) { console.error('Finance notify error', e); }
}

function* markSeenFinance() {
    try {
        yield call(api.put, '/po/mark-seen-finance');
        yield put(markSeenFinanceSuccess());
    } catch (e) { console.error('Mark seen error', e); }
}

export default function* poSaga() {
    yield all([
        takeLatest('po/createPO', createPO),
        takeLatest('po/fetchMyOrders', fetchMyOrders), // Kept original as 'fetchOrders' was not defined
        takeLatest('po/fetchOrderById', fetchOrderById),
        takeLatest('po/fetchProductionOrders', fetchProductionOrders), // Kept original as 'fetchOrders' was not defined
        takeLatest('po/fetchExportReadyOrders', fetchExportReadyOrders), // Kept original as 'fetchOrders' was not defined
        takeLatest('po/fetchFinanceOrders', fetchFinanceOrders), // Kept original as 'fetchOrders' was not defined
        takeLatest('po/updatePOStatus', updatePOStatus), // Kept original as 'updateStatus' was not defined
        takeLatest('po/fetchNotificationCount', fetchNotificationCount),
        takeLatest('po/startProduction', startProduction),
        takeLatest('po/deletePO', deletePO),
        takeLatest('po/markSeenByProduction', markSeenByProduction), // Kept original as 'markSeen' was not defined
        takeLatest('po/fetchFinanceNotificationCount', fetchFinanceNotificationCount),
        takeLatest('po/markSeenFinance', markSeenFinance),
    ]);
}
