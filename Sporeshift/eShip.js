import {fetch} from 'wix-fetch';
import wixData from 'wix-data';
import wixSecretsBackend from 'wix-secrets-backend';

export function eShipJSON(orderWixJSON){
	let jsonItems = []

	for(let i = 0; i < orderWixJSON.lineItems.length; i++){
		jsonItems.push({ 
			"description": orderWixJSON.lineItems[i].name, 
			"sku": orderWixJSON.lineItems[i].sku, 
			"quantity": orderWixJSON.lineItems[i].quantity,
			"weight":orderWixJSON.lineItems[i].weight,
			"value": orderWixJSON.lineItems[i].priceData.price
		})
	}
	
	let first = '';
	if(orderWixJSON.buyerNote != undefined){
		first = orderWixJSON.buyerNote;
	}

	let second = '';
	if(orderWixJSON.shippingInfo.shipmentDetails.address.addressLine2 != undefined){
		second = '\nAdress Line2: ' + orderWixJSON.shippingInfo.shipmentDetails.address.addressLine2;
	}

	var jsonOrder = {
		"order": {
			"order_date": orderWixJSON._dateCreated,
			"order_number": orderWixJSON.number,
			"reference": "Online Order",
			"shipping_method": "Express Shipping", //soon to optimize
			"signature_required": false, //soon to optimize
			"destination": {
				"name": orderWixJSON.shippingInfo.shipmentDetails.firstName + ' ' + orderWixJSON.shippingInfo.shipmentDetails.lastName,
				"company": orderWixJSON.shippingInfo.shipmentDetails.company,
				"email": orderWixJSON.shippingInfo.shipmentDetails.email,
				"phone": orderWixJSON.shippingInfo.shipmentDetails.phone,
				"street": orderWixJSON.shippingInfo.shipmentDetails.address.addressLine,
				"suburb": orderWixJSON.customField.value,
				"city": orderWixJSON.shippingInfo.shipmentDetails.address.city,
				"state": orderWixJSON.shippingInfo.shipmentDetails.address.country,
				"post_code": orderWixJSON.shippingInfo.shipmentDetails.address.postalCode,
				"country": "New Zealand", //soon to optimize
				"delivery_instructions": first + second
			},
			"items": jsonItems
		}
	}
	eShipSendData(jsonOrder, orderWixJSON);
}

export async function eShipSendData(jsonOrder, orderWixJSON){
	const ApiKey = await wixSecretsBackend.getSecret("ApiKey");
	const SubscriptionKey = await wixSecretsBackend.getSecret("SubscriptionKey");
	
	fetch( "https://api.starshipit.com/api/orders", {
	"method": "post",
	"headers": {
		"Content-Type": "application/json",
		"StarShipIT-Api-Key": ApiKey,
		"Ocp-Apim-Subscription-Key": SubscriptionKey
	},
	"body": JSON.stringify(jsonOrder)
	} )
	.then( (httpResponse) => {
		if (httpResponse.ok) {
			//console.log('good')
		return httpResponse.json();
		} else {
		return Promise.reject("Fetch did not succeed");
		}
	} )
	.then( (json) => {
		console.log(json.someKey);
		check(json, orderWixJSON);
	})
	.catch(err => {
		console.log(err)
		check(err, orderWixJSON, jsonOrder);
	});
}

export function check(json, orderWixJSON, jsonOrder){
	let toInsert = {
		"order": orderWixJSON.number,
		"ok": true,
		"json": json,
		"postJson": jsonOrder
	};
	wixData.insert('check', toInsert);
}