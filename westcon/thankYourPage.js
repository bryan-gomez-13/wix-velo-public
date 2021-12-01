// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import { updatePoints, getEmailUser, getLastOrder, available_sale} from 'backend/aModule.jsw'
import wixData from 'wix-data';
var points=0;
var check = false;

$w.onReady(async function() {
    //update points of user
    var email = "";
    var order = [];
    var total = 0;

    let emailU = getEmailUser()
    .then((response) =>
    {  
       email = response; 
    })

    let lastOrder = await getLastOrder()
    .then((order_response) => {
        order = order_response;
    })
    total = order.totals['subtotal'];
    await getPoints(emailU);
    console.log('xxxxxB: '+ points + '   total:'+total +'   check:'+check);

    if(check == true){
        console.log('reload page');
    }else{
        let is_okay = false;
        //console.log("available",available_sale(B, total))
        await available_sale(points, total)
        .then((available_bool) => {
            is_okay = available_bool;
            console.log(is_okay, available_bool);
        })

        if(is_okay){
            await updatePoints(email, total);
        }
    }
});


export async function getPoints(z){
    await wixData.query("BountyPoints")
    .eq("email", z)
    .find()
    .then( (results) => {
        if(results.items.length > 0) {
            if(results.items[0].check == true){
                check = true;
            }else{
                points = results.items[0].bountyPoints1;
                results.items[0].check = true;
                wixData.update("BountyPoints", results.items[0]);
            }
        } else {
            // handle case where no matching items found
        }
    } )
    .catch( (err) => {
        let errorMsg = err;
    } );
}