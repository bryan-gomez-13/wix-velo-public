// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import wixStores from 'wix-stores';
import { getCurrentCart, getUser, getEmailUser, available_sale } from 'backend/aModule.jsw';
import wixUsers from 'wix-users';
import wixData from 'wix-data';
var options = {
    "suppressAuth": true,
};
var pointsUser=0;
$w.onReady(async function() {
    var subtotal = 0;
    let user = getUser();
    let emailU  ="";
    
    let userEmail  = await getEmailUser().then((res) => {
        emailU = res;
        //console.log('email: ' + emailU);
    });

    let results = await getCurrentCart()
    .then((result) => {
        subtotal = result.totals.subtotal;
        //console.log('cart1: ' + result);
        //console.log('subtotal: '+subtotal);
    });
    
    await getPoints(emailU);

    var cartSubtotal = subtotal;
    //console.log('subtotal2:' + cartSubtotal)

    let aval = false;
    available_sale(pointsUser, cartSubtotal)
    .then((response) => {
        if(response === true){
            aval = true;
            $w("#notification").hide();
            $w("#box21").hide();
        }else{ 
            aval = false;
            $w("#notification").show();
            $w("#box21").show();
        }
    });
    //hook oncartchanged
    wixStores.onCartChanged((cart) => {
    cartSubtotal = cart.totals.subtotal;
    //console.log(cart);
    //console.log(cartSubtotal);
    available_sale(pointsUser, cartSubtotal)
    .then((response) => {
        if(response === true){
            aval = true;
            $w("#notification").hide();
            $w("#box21").hide();
        }else{ 
            aval = false;
            $w("#notification").show();
            $w("#box21").show();
        }
    });
    });
}
)

export async function getPoints(z){
    await wixData.query("BountyPoints")
    .eq("email", z)
    .find()
    .then( (results) => {
        if(results.items.length > 0) {
            pointsUser = results.items[0].bountyPoints1;
            results.items[0].check = false;
            wixData.update("BountyPoints", results.items[0]);

        } else {
            // handle case where no matching items found
        }
    } )
    .catch( (err) => {
        let errorMsg = err;
    } );
}