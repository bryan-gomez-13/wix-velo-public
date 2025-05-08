import { Permissions, webMethod } from "wix-web-module";
import { orders } from "wix-ecom-backend";
import { authentication } from "wix-members-backend";

// ========================== SIGN UP
export const registerNewMember = webMethod(Permissions.Anyone, (json) => {
    const options = {
        privacyStatus: 'PRIVATE',
        contactInfo: {
            firstName: json.firstName,
            lastName: json.lastName
        }
    }

    return authentication.register(json.email, json.password, options).then((registrationResult) => {
        return registrationResult;
    }).catch((error) => { console.error(error); });
}, );

// ========================== GET ORDER INFO
export const getOrderInfo = webMethod(Permissions.Anyone, async (orderId) => {
    try {
        const retrievedOrder = await orders.getOrder(orderId);
        if (retrievedOrder.paymentStatus == 'NOT_PAID') return true
        else return false
    } catch (error) { console.error(error); }
}, );