import wixData from 'wix-data';

export async function shipping(options, context) {
    //console.log('Opt', options)
    //console.log('Context', context)

    let items = options.lineItems;
    let frzn = false;
    let weight = 0;
    let fWeight = 0;
    let total = 0;

    //All products
    for (let i = 0; i < items.length; i++) {
        //console.log(items[i].physicalProperties.weight + " -- " + items[i].quantity + " -- " + items[i].physicalProperties.weight * items[i].quantity)
        if (items[i].physicalProperties.sku.includes('FRZN')) frzn = true
        fWeight += items[i].physicalProperties.weight * items[i].quantity
        total += parseFloat(items[i].totalPrice);
    }
    weight = fWeight.toFixed(1);
    //console.log(1, total)
    //console.log(2, weight)
    //console.log(3, weight, frzn, options.shippingDestination.subdivision)

    let wixOptions = {
        "suppressAuth": true,
        "suppressHooks": true
    };

    let jsonCity = await wixData.query('SFCity').eq('subdivision', options.shippingDestination.subdivision).find(wixOptions).then((results) => { return results.items[0] })
    let jsonRegion = await wixData.query('SFRegions').eq('_id', jsonCity.regions).find(wixOptions).then((results) => { return results.items[0] })
    let jsonOptions = await wixData.query('SFShippingOptions').eq('region', jsonCity.regions).ascending('weightL').find(wixOptions).then((results) => { return results.items })

    //console.log(4, 'City', jsonCity)
    //console.log(5, 'Region', jsonRegion)
    //console.log(6, 'Options', jsonOptions)

    let shipping = []
    let normal = false;

    // ==============================================================   OPTION 1  ==============================================================
    if (total >= 100) {
        //console.log(7, '100')
        if (frzn && jsonRegion.shippingName == "Auckland Shipping") {
            shipping.push({
                "code": "FreeShipping",
                "title": "Free Shipping",
                "logistics": {
                    "deliveryTime": "Dispatching Mon to Wed"
                },
                "cost": {
                    "price": "0",
                    "currency": context.currency
                }
            })
        } else if (frzn == false && total >= 100) {
            shipping.push({
                "code": "FreeShipping",
                "title": "Free Shipping",
                "logistics": {
                    "deliveryTime": "Dispatching Tomorrow (Business hours)"
                },
                "cost": {
                    "price": "0",
                    "currency": context.currency
                }
            })
        } else normal = true
    } else normal = true
    //console.log(normal)

    // ==============================================================   NORMAL SHIPPING  ==============================================================
    if (normal) {
        //console.log(8, "normal")
        let index = 0
        for (let i = 0; i < jsonOptions.length; i++) {
            if (!(i == jsonOptions.length - 1)) {
                if ((jsonOptions[i].weightL < weight || jsonOptions[i].weightL == weight) && (weight < jsonOptions[i].weightH || weight == jsonOptions[i].weightH)) {
                    index = i
                    break
                }
            } else index = jsonOptions.length - 1
        }
        //console.log(9, 'Rate', jsonOptions[index])
        //console.log(10, "Rate:" + jsonOptions[index].rate)
        //console.log(11, "Frzn:" + jsonOptions[index].rateFrzn)

        if (frzn) {
            let costPrice = await price(jsonOptions[index].rateFrzn)
            //console.log("Cost:" + costPrice)
            shipping.push({
                "code": jsonRegion.code,
                "title": jsonRegion.shippingFrozenName,
                "logistics": {
                    "deliveryTime": jsonRegion.deliveryTimeFrzn
                },
                "cost": {
                    "price": (costPrice + jsonRegion.value) + "",
                    "currency": context.currency
                }
            })
        } else {
            let costPrice = await price(jsonOptions[index].rate)
            //console.log("Cost:" + costPrice)
            shipping.push({
                "code": jsonRegion.code,
                "title": jsonRegion.shippingName,
                "logistics": {
                    "deliveryTime": jsonRegion.deliveryTime
                },
                "cost": {
                    "price": costPrice + "",
                    "currency": context.currency
                }
            })
        }
    }

    //console.log(13, "shipping", shipping)
    return shipping

}

function price(value) {
    let value2 = parseInt(value)
    let total = value - value2
    if (total < 0.5) return value2
    else return value2 + 0.5
}

// ==============================================================   OPTION 2  ==============================================================
/*
if (total >= 100) {
    if (frzn) {
        // ====================================================================================================================
        switch (jsonRegion.shippingName) {
        case "Auckland Shipping":
            shipping.push({
                "code": "FreeShipping",
                "title": "Free Shipping",
                "logistics": {
                    "deliveryTime": "Dispatching Tomorrow (Business hours)"
                },
                "cost": {
                    "price": "0",
                    "currency": context.currency
                }
            })
            break;

        case "South Island Shipping":
            shipping.push({
                "code": "FreeShipping",
                "title": "Frozen Shipping",
                "logistics": {
                    "deliveryTime": "Dispatching Mon to Wed"
                },
                "cost": {
                    "price": "15",
                    "currency": context.currency
                }
            })
            break;

        case "North Island Shipping":
            shipping.push({
                "code": "FreeShipping",
                "title": "Frozen Shipping",
                "logistics": {
                    "deliveryTime": "Dispatching Mon to Wed"
                },
                "cost": {
                    "price": "10",
                    "currency": context.currency
                }
            })
            break;

            // ====================================================================================================================
        }
    } else if (frzn == false && total >= 100) {
        shipping.push({
            "code": "FreeShipping",
            "title": "Free Shipping",
            "logistics": {
                "deliveryTime": "Dispatching Tomorrow (Business hours)"
            },
            "cost": {
                "price": "0",
                "currency": context.currency
            }
        })
    } else normal = true
} else normal = true
*/