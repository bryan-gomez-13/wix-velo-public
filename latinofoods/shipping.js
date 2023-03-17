import wixData from 'wix-data';

export async function shipping(options, context) {
    //console.log('Opt', options)

    let items = options.lineItems;
    let frzn = false;
    let weight = 0;

    //All products
    for (let i = 0; i < items.length; i++) {
        if (items[i].physicalProperties.sku.includes('FRZN')) frzn = true
        
        weight += items[i].physicalProperties.weight * items[i].quantity
        //console.log(items[i].name,items[i].physicalProperties.weight, weight)
    }
    //console.log(weight, frzn, items, options.shippingDestination.subdivision)

    let wixOptions = {
        "suppressAuth": true,
        "suppressHooks": true
    };

    let jsonCity = await wixData.query('SFCity').eq('subdivision', options.shippingDestination.subdivision).find(wixOptions).then((results) => { return results.items[0] })
    let jsonRegion = await wixData.query('SFRegions').eq('_id', jsonCity.regions).find(wixOptions).then((results) => { return results.items[0] })
    let jsonOptions = await wixData.query('SFShippingOptions').eq('region', jsonCity.regions).ascending('weightL').find(wixOptions).then((results) => { return results.items })

    //console.log('City', jsonCity)
    //console.log('Region', jsonRegion)
    //console.log('Options', jsonOptions)

    let index = 0
    for (let i = 0; i < jsonOptions.length; i++) {
        if (!(i == jsonOptions.length - 1)) {
            if (jsonOptions[i].weightL < weight && weight < jsonOptions[i].weightH) {
                index = i
                break
            }
        } else index = jsonOptions.length - 1
    }
    //console.log('Rate', jsonOptions[index])
    //console.log(jsonOptions[index].rate)

    let shipping = []
    if (frzn) {
        shipping.push({
            "code": jsonRegion.code,
            "title": jsonRegion.shippingFrozenName,
            "logistics": {
                "deliveryTime": jsonRegion.deliveryTime
            },
            "cost": {
                "price": (jsonOptions[index].rate + jsonRegion.value) + "",
                "currency": context.currency
            }
        })
    } else {
        shipping.push({
            "code": jsonRegion.code,
            "title": jsonRegion.shippingName,
            "logistics": {
                "deliveryTime": jsonRegion.deliveryTime
            },
            "cost": {
                "price": jsonOptions[index].rate + "",
                "currency": context.currency
            }
        })
    }

    //console.log(shipping)
    return shipping
}