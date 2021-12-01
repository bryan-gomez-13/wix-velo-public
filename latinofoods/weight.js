import wixStores from 'wix-stores';

var weight_item = 0;

$w.onReady(function () {
	weight();

	wixStores.onCartChanged((cart) => {
		weight_item = 0;
		weight();
	});
});

export function weight(){

	wixStores.getCurrentCart()
	.then((cartData) => {
		//console.log(cartData.lineItems);
		for(let i = 0; i < cartData.lineItems.length; i++){
			if(cartData.lineItems[i].sku.includes('FRZN') == true){
				console.log(cartData.lineItems[i]);
				weight_item = weight_item + (parseFloat(cartData.lineItems[i].weight)*cartData.lineItems[i].quantity);
			}
		}
		console.log(weight_item);
		if(weight_item >= 5){
			$w('#information').collapse();
			$w('#box1').collapse();
			$w('#mobileBox1').collapse();
		}else{
			$w('#information').expand();
			$w('#box1').expand();
			$w('#mobileBox1').expand();
		}
	});	
}