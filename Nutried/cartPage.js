import wixWindowFrontend from 'wix-window-frontend';
import { createOrder } from 'backend/inventory';
import { cart } from 'wix-stores-frontend';
import wixLocation from 'wix-location';
import wixData from 'wix-data';
var subtotalText = 0;
var jsonItems = [],
    items = [];

var variable = true
$w.onReady(function () {
    $w('#checkout').onClick(() => createOrderWix());
	if(wixWindowFrontend.formFactor == "Mobile") $w('#checkoutMob').onClick(() => createOrderWix());
    createJSON();
    cart.onChange(() => {
        if (variable) createJSON();
    });
});

async function createJSON() {
    await cart.getCurrentCart().then((currentCart) => {
        items = currentCart.lineItems;
        if (currentCart.lineItems.length > 0) {
			$w('#box1').show();
			if(wixWindowFrontend.formFactor == "Mobile") $w('#mobileBox1').show();
            for (let i = 0; i < items.length; i++) {
                let json = {
                    "productId": items[i].productId,
                    "lineItemType": items[i].lineItemType,
                    "mediaItem": {
                        "altText": items[i].name,
                        "src": items[i].mediaItem.src
                    },
                    "name": items[i].name,
                    "quantity": parseFloat(items[i].quantity),
                    "sku": items[i].sku,
                    "weight": parseFloat(items[i].weight),
                    "priceData": {
                        "price": parseFloat(items[i].price)
                    }
                }
                subtotalText += parseFloat(items[i].quantity) * parseFloat(items[i].price);
                jsonItems.push(json)
            }
        }else {
			$w('#box1').hide()
			if(wixWindowFrontend.formFactor == "Mobile") $w('#mobileBox1').show();
		}
    }).catch((error) => console.error(error));
    $w('#subtotal').text = "Subtotal		AU$" + subtotalText.toFixed(2)
}

async function deleteCart() {
    variable = false
    $w('#cart').hide();
    for (let i = 0; i < items.length; i++) {
        await cart.removeProduct(items[i].id)
            .then((updatedCart) => {
                console.log(updatedCart)
            })
            .catch((error) => console.error(error))
    }
}

async function createOrderWix() {
    $w('#loading').show();
    let Info = {
        "deliveryOption": "SHIPPING TO YOUR STORE - TO BE CONFIRMED\nFee calculated after you place the order",
        "shipmentDetails": {
            "address": {
                "formatted": "10 Chittaway Rd, Ourimbah NSW 2258, Australia",
                "city": "Ourimbah",
                "country": "AU",
                "addressLine": "10 Chittaway Rd",
                "postalCode": "2258",
            },
            "lastName": "Newcastle Edu",
            "firstName": "Nienke de Vlieger",
            "email": "nienke.devlieger@newcastle.edu.au",
            "phone": "+61432522072",
            "company": "Grocery Shop UON",
        }
    }

    let BillingInfo = {
        "address": {
            "formatted": "10 Chittaway Rd, Ourimbah NSW 2258, Australia",
            "city": "Ourimbah",
            "country": "AU",
            "addressLine": "10 Chittaway Rd",
            "postalCode": "2258",
        },
        "lastName": "Newcastle Edu",
        "firstName": "Nienke de Vlieger",
        "email": "nienke.devlieger@newcastle.edu.au",
        "phone": "+61432522072",
        "company": "Grocery Shop UON",
    }

    let orderW = {
        "lineItems": jsonItems,
        "totals": {
            "subtotal": subtotalText,
            "total": subtotalText
        },
        "channelInfo": {
            "type": "WEB"
        },
        "paymentStatus": "NOT_PAID",
        "buyerNote": "",
        "shippingInfo": Info,
        "billingInfo": BillingInfo
    }

    await createOrder(orderW)
        .then(async (order) => {
            console.log(order)
            //await deleteCart();
            setTimeout(() => { wixLocation.to('https://nutriedproject.wixsite.com/myshop/thank-you-page/' + order._id); }, 1000);

        }).catch(async (error) => {
            let options = { "suppressAuth": true, "suppressHooks": true };
            let json = { "error": error };

            await wixData.insert("CatchError", json, options)
                .then((results) => console.log(results))
                .catch((err) => console.log(err))
            console.error(error);
        });
}