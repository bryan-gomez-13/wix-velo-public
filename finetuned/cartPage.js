import wixStores from 'wix-stores';

var quantity1 = 0;
var quantity2 = 0;


$w.onReady(function () {
	quantityCart();

	wixStores.onCartChanged((cart) => {
		quantity1 = 0;
		quantity2 = 0;
		let x = quantityCart();
		if(x == 0){
			$w('#sliderGallery1').collapse();
		}
	});
});

function quantityCart (){
	wixStores.getCurrentCart()
	.then((cartData) => {
		console.log(cartData.lineItems);
		for(let i = 0; i < cartData.lineItems.length; i++){
			let a = cartData.lineItems[i].options.length;
			if(a === 5){
				quantity1 = quantity1 + cartData.lineItems[i].quantity;
				$w('#sliderGallery1').expand();
			}
		}
		console.log("quantity1 "+quantity1);
		for(let i = 0; i < cartData.lineItems.length; i++){
			if(cartData.lineItems[i].sku.includes('FREE') == true){
				quantity2 = quantity2 + cartData.lineItems[i].quantity;
				console.log("quantity2 "+quantity2);
				if(quantity2 > quantity1){
					wixStores.removeProductFromCart(cartData.lineItems[i].id)
					.then((updatedCart) => {
						$w('#sliderGallery1').expand();
					})
					.catch((error) => {
						// Product not removed
						console.error(error);
					});
				}else if(quantity2 == quantity1){
					$w('#sliderGallery1').collapse();
				}
			}
		}
	})
	.catch((error) => {
		console.log(error);
	});
	return quantity1;
}