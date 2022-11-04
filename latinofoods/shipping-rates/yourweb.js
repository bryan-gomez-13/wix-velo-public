/**
 * This function is automatically called by Wix eCommerce to retrieve the shipping rates provided by your extension.
 * This happens when certain actions are performed on the cart and/or checkout. For example, when an item is added to the cart.
 *
 * Shipping Rates Velo SPI reference: https://www.wix.com/velo/reference/spis/ecom-shipping-rates.
 * @param {import('interfaces-ecom-v1-shipping-rates-provider').GetShippingRatesOptions} options
 * @param {import('interfaces-ecom-v1-shipping-rates-provider').Context} context
 * @returns {Promise<import('interfaces-ecom-v1-shipping-rates-provider').GetShippingRatesResponse>}
 */

 import { info } from 'backend/eShip.jsw'
 export const getShippingRates = async (options, context) => {
     console.log(options, context)
     
         let respond = await info(options, context)
         let rJson = {
             "shippingRates": respond
         }
         //console.log(rJson)
         return rJson
 };