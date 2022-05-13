import { fetch } from 'wix-fetch';
import wixWindow from "wix-window";
import wixStores from 'wix-stores';

var weight_item = 0;
var confirm2 = 0;
var confirm;

$w.onReady(async function () {
    //Get city
    await getUserIP();
    //frozen();
    weight();
    $w('#checkFrozen').onChange(() => weight())
    wixStores.onCartChanged((cart) => weight());
});
/*
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

export function deleteFrozen(cartData) {
    for (let i = 0; i < cartData.lineItems.length; i++) {
        //console.log(cartData.lineItems.length);
        let a = cartData.lineItems[i].sku.includes('FRZN');
        if (a == true) {
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
*/
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
            //console.log(city);

            if (city === "Auckland") {
                $w('#promo').expand();
            } else {
                $w('#promo').collapse();
            }

            return city;
        })
}

export function weight() {
    //console.log("weight");
    weight_item = 0;
    let frz = false;

    wixStores.getCurrentCart()
        .then((cartData) => {
            for (let i = 0; i < cartData.lineItems.length; i++) {
                if (cartData.lineItems[i].sku.includes('FRZN') == true) {
                    //console.log(cartData.lineItems[i]);
                    frz = true;
                    weight_item = weight_item + (parseFloat(cartData.lineItems[i].weight) * cartData.lineItems[i].quantity);
                }
            }
            let x = 0;
            //console.log(weight_item);
            let formFactor = wixWindow.formFactor
            //console.log(x)
            if (frz) {
                $w('#checkFrozen').expand();
                if ((weight_item >= 4 || weight_item == 0)) {
                    $w('#frznProducts').collapse();
                    $w('#weight').hide();
                    x++;
                    if (formFactor == "Mobile") {
                        $w('#mobileText1').hide();
                    }
                } else {
                    $w('#frznProducts').expand();
                    $w('#weight').show();
                    if (x != 0) x--;
                    if (formFactor == "Mobile") {
                        $w('#mobileText1').show();
                    }
                }
                //console.log(x)
                //console.log($w('#checkFrozen').checked)

                if ($w('#checkFrozen').checked == true) {
                    $w('#Check').hide();
                    if (formFactor == "Mobile") {
                        $w('#mobileText2').hide();
                    }
                    x++;
                } else {
                    $w('#Check').show();
                    if (formFactor == "Mobile") {
                        $w('#mobileText2').show();
                    }
                    if (x != 0) x--;
                }
                //console.log(x)

                if (x == 2) {
                    $w('#box3').hide();
                    if (formFactor == "Mobile") {
                        $w('#mobileBox1').hide();
                    }
                } else {
                    $w('#box3').show();
                    if (formFactor == "Mobile") {
                        $w('#mobileBox1').show();
                    }
                }
            }else{
                $w('#checkFrozen').collapse();
            }

        });
}