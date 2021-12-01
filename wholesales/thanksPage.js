import wixData from 'wix-data';

var weightOrder=0;
var name = '';
var idOrder = 0;

$w.onReady(async function () {
	await putWeightOrders();
});

export async function putWeightOrders(){
	await $w('#thankYouPage1').getOrder()
	.then((order) => {
		weightOrder =  order.totals.weight;
		name = order.billingInfo.firstName + ' ' +  order.billingInfo.lastName;
		idOrder = order.number;
	})
	.catch((error) => {
		console.log(error);
	});

	console.log(weightOrder +'	'+name+'	'+ idOrder);

	let options = {
		"suppressAuth": true,
		"suppressHooks": true
	};

	let toUpdate = {
  		"order": idOrder,
		"nameBuyer":  name,
		"weightKg": weightOrder
	};
	wixData.insert("weightOrders", toUpdate, options)
		.then( (results) => {
			let item = results; //see item below
		} )
		.catch( (err) => {
			let errorMsg = err;
		} );
}

//=====================================================
// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';

$w.onReady(async function () {
	await putWeightOrders();
});

export function putWeightOrders(){
	// Write your JavaScript here
	let options = {
	"suppressAuth": true
	};
	var weightOrder = 0;
	var name = "";
	var lastname = "";
	var idOrder;
await $w('#thankYouPage1').getOrder()
  .then((order) => {
	weightOrder =  order.totals.weight;
	console.log('order');
	console.log(order);
	console.log(order.totals);
	console.log('weightOrder	');
	console.log(weightOrder);
	name = order.billingInfo.firstName;
	lastname = order.billingInfo.lastName;
	idOrder = order.number;
	console.log(idOrder);
    // see example order object below
  })
  .catch((error) => {
    console.log(error);
  });

let completeName = name + " " + lastname;
console.log('completeName	'+completeName);
let toInsert = {
  "order": idOrder,
  "nameBuyer":  completeName,
  "weightKg": weightOrder
};
console.log('toInsert	');
console.log(toInsert);
await wixData.insert("weightOrders", toInsert, options)
	.then( (results) => {
		console.log('perfect')
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
	// To select an element by ID use: $w("#elementID")

	// Click "Preview" to run your code
}