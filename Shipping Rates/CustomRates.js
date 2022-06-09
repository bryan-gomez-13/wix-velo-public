/*********
 * When you enable this shipping integration on your site's dashboard, Wix Stores calls this file's getShippingRates function to retrieve shipping rates. 
 ********/

/********* Example implementation:
                                                           
 export const getShippingRates = (items, options) => {       
     console.log("log", items, options);                     
     return {                                                
         "shippingRates": [{                                 
             "code": "usps_international_2",                 
             "title": "USPS International - First Class",    
             "cost": {                                       
                 "price": "42",                              
                 "currency": "EUR",                          
                 "additionalCharges": [{
                       "price": "12",
                       "details": "Shipping surcharges and handling fees"
                 }]                     
             },
             "logistics": {
                    "deliveryTime": "2-5 days",
                    "instructions": "Please be available"
             }                                               
         }]                                                  
     };                                                      
 }
*********/
import { getRatesByWeight } from './rates-by-weight.js';
import { getRatesByQuantity } from './rates-by-quantity.js';
import { rates } from 'backend/eShip'

export const getShippingRates = async (items, options) => {

    let finalRates = await eShipCost(items, options)
    return { 'shippingRates': finalRates };

}

async function eShipCost(items, options) {
    let packages = [];
    let weight = 0;
    for (let i = 0; i < items.length; i++) {
        weight += items[i].quantity * items[i].physicalProperties.weight;
    }
    let Box_eShip = Math.ceil(weight / 25)

    for (let i = 0; i < Box_eShip; i++) {
        let json = {};
        if (weight > 25) {
            weight = weight - 25;
            json = {
                "weight": 25
            }
        } else {
            json = {
                "weight": weight
            }
        }

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
            "street": options.shippingDestination.addressLine1,
            "suburb": options.shippingDestination.suburb,
            "city": options.shippingDestination.city,
            "post_code": options.shippingDestination.postalCode,
            "country_code": options.shippingDestination.country
        },
        "packages": packages
    }

    //console.log(json);
    let ratesArray = await rates(json);
    let jsonRates = []
    for (let i = 0; i < ratesArray.rates.length; i++) {
        let json = {
            "code": ratesArray.rates[i].service_code, // A unique identifier               
            "title": ratesArray.rates[i].service_name,
            "cost": {
                "price": ratesArray.rates[i].total_price,
                "currency": "NZD",
            }/*,
            "logistics": {
                "deliveryTime": "2-5 days",
                "instructions": "Please be available"
            }*/
        }
        jsonRates.push(json)
    }
    return jsonRates;
}