import { createPayment } from 'backend/collections.web.js';

export function Payouts_afterUpdate(item, context) {
    if (item.createPayment) createPayment(item);
}