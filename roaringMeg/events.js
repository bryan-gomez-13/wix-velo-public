import wixData from 'wix-data';
import { initialize } from 'backend/SaveOrder'

export async function wixStores_onNewOrder(event) {
    //console.log(event)
    const newOrderId = event.orderId;
    //console.log(newOrderId)
    await wixData.get("Stores/Orders", newOrderId)
        .then((order) => {
            //console.log(order)
            let createOrder = false
            for (let i = 0; i < order.lineItems.length; i++) {
                if (order.lineItems[i].sku) console.log("Fire PIT")
                else createOrder = true
            }
            if (createOrder) return initialize(order)
        })
        .catch((error) => {
            console.error(error);
        });
}