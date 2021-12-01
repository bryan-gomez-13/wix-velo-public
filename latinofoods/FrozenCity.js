import wixWindow from "wix-window";
import wixStores from 'wix-stores';

$w.onReady(function () {
    
});

export function button3_click(event) {
	wixWindow.lightbox.close();
}

export function button4_click(event) {
	let cartData = wixWindow.lightbox.getContext().cartdata;
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
    wixWindow.lightbox.close({
        "confirm": true
    });
}