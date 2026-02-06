import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { shipping } from 'backend/ShippingRates/shipping.web.js'
import wixSecretsBackend from 'wix-secrets-backend';
import { getAllCollectionsInfo } from 'backend/collections.web.js';
let shippingArray = [];

export const info = webMethod(Permissions.Anyone, async (cartData, context) => {
    const variables = await getAllCollectionsInfo("ShippingVariables");

    // Shipping Variables
    // Default product weight
    const v0 = variables.find(item => item._id == "15356e24-695c-477a-a7ea-d08cc395a9d0");
    // Free shipping threshold (Auckland)
    const v1 = variables.find(item => item._id == "247942f5-5b2a-43eb-8370-28bb1cddbe8a");
    // Urgent delivery surcharge (Auckland)
    const v2 = variables.find(item => item._id == "c0a06112-de8c-44ba-b184-0320172357ee");
    // Free shipping threshold (Other NZ regions)
    const v3 = variables.find(item => item._id == "ba796955-db6b-4a2a-8bde-45ce87caa66e");
    // Box weight limit (eShip calculation)
    const v4 = variables.find(item => item._id == "52c2064e-c6fa-492f-b3ef-3c5790285f1f");
    // Frozen products surcharge (SF Regions)
    const v5 = variables.find(item => item._id == "ce5b7632-b197-47bf-a573-14a8707ff839");
    // Outside Auckland discount factor 
    const v6 = variables.find(item => item._id == "5fe0c5bf-4a08-424e-b40f-44a521fe59e4");
    // Save shipping calculation details
    const v7 = variables.find(item => item._id == "714f49f9-8af3-4af0-a7e8-991f7d7c6642");
    // Save shipping calculation details
    const v8 = variables.find(item => item._id == "d1c4a856-abc2-4b1b-9d4c-ac0178c80f51");

    let items = cartData.lineItems;
    let weight_eShip = 0;
    let Box_eShip = 0;
    let frzn = false;
    let price = 0;
    let discount50 = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].physicalProperties.sku.includes('FRZN')) frzn = true
        const itemWeight = (items[i].physicalProperties.weight) ? items[i].physicalProperties.weight : v0.value;

        weight_eShip = weight_eShip + (itemWeight * items[i].quantity);
        price += cartData.lineItems[i].quantity * parseFloat(cartData.lineItems[i].price);
    }

    if (cartData.shippingDestination.city && cartData.shippingDestination.addressLine1) {
        let packages = [];

        //  FREE
        if (price >= v1.value && cartData.shippingDestination.city === "Auckland" && v1.boolean) {
            let deliveryTime = (frzn) ? "Dispatching Mon to Wed" : "Dispatching Tomorrow (Business hours)";
            //console.log('Free Shipping Auckland')
            shippingArray.push({
                "code": "FreeShipping",
                "title": "Free Shipping",
                "logistics": { "deliveryTime": deliveryTime },
                "cost": {
                    "price": "0",
                    "currency": context.currency
                }
            })

            if (frzn && v2.boolean) {
                shippingArray.push({
                    "code": "frzn-auk",
                    "title": "Urgent Delivery",
                    "logistics": {
                        "deliveryTime": "6-9pm same or next day business day"
                    },
                    "cost": {
                        "price": `${v2.value}`,
                        "currency": context.currency
                    }
                })
            }

            if (v8.boolean && frzn) {
                shippingArray.push({
                    "code": "PickupAuckland",
                    "title": v8.shippingTitle,
                    "logistics": {
                        deliveryTime: v8.shippingDeliveryTime,
                        instructions: v8.shippingInstructions
                    },
                    "cost": {
                        "price": "0",
                        "currency": context.currency
                    }
                })
            }

            return shippingArray;
        } else if (price >= v3.value && cartData.shippingDestination.city !== "Auckland" && v3.boolean) discount50 = true;

        Box_eShip = Math.ceil(weight_eShip / v4.value)

        for (let i = 0; i < Box_eShip; i++) {
            let json = {};
            if (weight_eShip > v4.value) {
                weight_eShip = weight_eShip - v4.value;
                json = { "weight": v4.value }
            } else json = { "weight": weight_eShip }
            packages.push(json)
        }

        let json = {
            "sender": {
                "street": "3 Porters Avenue",
                "suburb": "Eden Terrace",
                "city": "Auckland",
                "post_code": "1024",
                "country_code": "NZ"
            },
            "destination": {
                "street": cartData.shippingDestination.addressLine1,
                "suburb": "",
                "city": cartData.shippingDestination.city,
                "post_code": cartData.shippingDestination.postalCode,
                "country_code": cartData.shippingDestination.country
            },
            "packages": packages,
            "currency": context.currency
        }
        console.log(json);

        // ================================= CALCULATE RATES

        let array = []
        if (cartData.shippingDestination.city === "Auckland" && v8.boolean && frzn) {
            array.push({
                "code": "PickupAuckland",
                "title": v8.shippingTitle,
                "logistics": {
                    deliveryTime: v8.shippingDeliveryTime,
                    instructions: v8.shippingInstructions
                },
                "cost": {
                    "price": "0",
                    "currency": context.currency
                }
            })
        }
        let rRates = await rates(json);
        console.log("rates", rRates)

        if (rRates.length > 0) {
            let priceRateValue;

            if (frzn) priceRateValue = rRates.find(ratesEShip => ratesEShip.service_name.includes("Overnight"));
            else priceRateValue = rRates.find(ratesEShip => ratesEShip.service_name.includes("Economy"));

            // if (priceRateValue == undefined) priceRateValue = rRates[0];
            if (priceRateValue == undefined) priceRateValue = rRates.find(ratesEShip => ratesEShip.service_name.includes("Courier Parcel"));

            let priceOrder = Math.round(priceRateValue["total_price"]);

            let wixOptions = { "suppressAuth": true, "suppressHooks": true };

            let jsonCity = await wixData.query('SFCity').eq('subdivision', cartData.shippingDestination.subdivision).find(wixOptions).then((results) => { return results.items[0] })
            let jsonRegion = await wixData.query('SFRegions').eq('_id', jsonCity.regions).find(wixOptions).then((results) => { return results.items[0] });

            priceOrder = (frzn && v5.boolean) ? (priceOrder + jsonRegion.frozenValue) : priceOrder;
            if (discount50) priceOrder = priceOrder * v6.value;

            let jsonA = {
                "code": priceRateValue["service_code"],
                "title": (frzn) ? jsonRegion.shippingFrozenName : jsonRegion.shippingName,
                "logistics": {
                    "deliveryTime": (frzn) ? jsonRegion.deliveryTimeFrzn : jsonRegion.deliveryTime
                },
                "cost": {
                    "price": priceOrder + "",
                    "currency": context.currency
                }
            }
            array.push(jsonA);
            // if (cartData.shippingDestination.subdivision === "NZ-AUK" && frzn) {
            //     array.push({
            //         "code": "frzn-auk",
            //         "title": "Urgent Delivery",
            //         "logistics": {
            //             "deliveryTime": "6-9pm same or next day business day"
            //         },
            //         "cost": {
            //             "price": "15",
            //             "currency": context.currency
            //         }
            //     })
            // }

            if (v7.boolean) {
                let saveInfoShipping = {
                    "cartData": cartData,
                    "jsonEship": json,
                    "shipping": array
                }
                await saveShipping(saveInfoShipping);
            }

            //console.log('Cost eShip')
            return array
        } else {
            //console.log('Cost S')
            return await shipping(cartData, context)
        }
    } else {
        return await shipping(cartData, context)
    }
});

async function saveShipping(saveInfoShipping) {
    let options = {
        "suppressAuth": true,
        "suppressHooks": true
    };
    await wixData.insert("CustomersShippingRates", saveInfoShipping, options)
        .catch((err) => { console.log(err) });
}

export const rates = webMethod(Permissions.Anyone, async (json) => {
    const ApiKey = await wixSecretsBackend.getSecret("ApiKey");
    const SubscriptionKey = await wixSecretsBackend.getSecret("SubscriptionKey");
    let rate;

    await fetch("https://api.starshipit.com/api/rates", {
            "method": "post",
            "headers": {
                "Content-Type": "application/json",
                "StarShipIT-Api-Key": ApiKey,
                "Ocp-Apim-Subscription-Key": SubscriptionKey
            },
            "body": JSON.stringify(json)
        })
        .then((httpResponse) => {
            if (httpResponse.ok) {
                //console.log('Done');
                return httpResponse.json();
            } else {
                return Promise.reject("Fetch did not succeed");
            }
        }).then((json) => {
            //console.log('json', json);
            rate = json.rates;
        })
        .catch((err) => {
            console.log(err);
        });
    return rate;
})