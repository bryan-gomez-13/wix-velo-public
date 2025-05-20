import { Permissions, webMethod } from "wix-web-module";
import { orders } from 'wix-pricing-plans.v2';
import { contacts } from "wix-crm-backend";
import { elevate } from 'wix-auth';

const elevatedCancelOrder = elevate(orders.cancelOrder);

// Get Contact Info
export const getContactInfo = webMethod(Permissions.Anyone, (contactId) => {
    const options = { suppressAuth: true };

    return contacts.getContact(contactId, options).then((contact) => { return contact })
        .catch((error) => { console.error(error) });
});

// Cancel Orders
export const cancelOrders = webMethod(Permissions.Anyone, async (_id) => {
    try {
        await elevatedCancelOrder(_id, "IMMEDIATELY");
    } catch (error) { console.error(error) }
});