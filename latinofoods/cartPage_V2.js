import { fetch } from 'wix-fetch';
import wixWindow from "wix-window";
import wixStores from 'wix-stores';

var weight_item = 0;
var confirm2 = 0;
var confirm;

$w.onReady(async function () {
    //Get city
    await getUserIP();

    frozen();

    weight();

    wixStores.onCartChanged((cart) => {
		weight_item = 0;
		weight();
	});
});

//Get frozen products
export function frozen() {
    //MENSAJE EMERGENTE
    wixStores.getCurrentCart()
    .then((cartData) => {
        for (let i = 0; i < cartData.lineItems.length; i++) {
            let a = cartData.lineItems[i].sku.includes('FRZN');
            if (a == true) {
                wixWindow.openLightbox("FrozenCity", {
                    "cartdata": cartData
                })
                .then((data) => {
                    confirm = data.confirm;
                    if (confirm == true) {
                        deleteFrozen(cartData);
                    }
                });
                break;
            }
        }
    })
    .catch((error) => {
        console.log(error);
    });
}

export function deleteFrozen(cartData){
    for(let i = 0; i < cartData.lineItems.length; i++){
        console.log(cartData.lineItems.length);
        let a = cartData.lineItems[i].sku.includes('FRZN');
        if(a == true){
            wixStores.removeProductFromCart(cartData.lineItems[i].id)
            .then((updatedCart) => {
                // Product successfully removed
                const cartLineItems = updatedCart.lineItems;
            })
            .catch((error) => {
                // Product not removed
                console.error(error);
            });
        }
    }
}

//Get city
export function getUserIP() {
    fetch('https://extreme-ip-lookup.com/json', {
            method: 'get'
        })
        .then((httpResponse) => {
            if (httpResponse.ok) {
                return httpResponse.json();
            }
        }).then((json) => {
            let city = json.city;
            console.log(city);

            if(city === "Auckland"){
                $w('#promo').expand();
                $w('#group31').expand();
            }else{
                $w('#promo').collapse();
                $w('#group31').collapse();
            }

            return city;
        })
}

export function weight(){
    console.log("weight");

	wixStores.getCurrentCart()
	.then((cartData) => {
		for(let i = 0; i < cartData.lineItems.length; i++){
			if(cartData.lineItems[i].sku.includes('FRZN') == true){
				console.log(cartData.lineItems[i]);
				weight_item = weight_item + (parseFloat(cartData.lineItems[i].weight)*cartData.lineItems[i].quantity);
			}
		}
		console.log(weight_item);
		if(weight_item >= 4 || weight_item == 0){
			$w('#frznProducts').collapse();
			$w('#box3').collapse();
			$w('#mobileBox1').collapse();
		}else{
			$w('#frznProducts').expand();
			$w('#box3').expand();
			$w('#mobileBox1').expand();
		}
	});	
}