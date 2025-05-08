import { createPayment } from 'backend/collections.web.js';

export function Payouts_afterUpdate(item, context) {
    const nextCommission = item.nextCommissionPayment;
    if (item.createPayment) createPayment(item, nextCommission);
}