import { info } from 'backend/eShip.jsw'
import { shipping } from 'backend/shipping.jsw'
export const getShippingRates = async (options, context) => {
    //Delivery
    let respond = await shipping(options, context)
    return {
        "shippingRates": respond
    };
};