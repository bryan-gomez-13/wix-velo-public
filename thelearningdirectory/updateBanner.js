import wixPaidPlans from 'wix-paid-plans';

var orders = [];
$w.onReady(async function () {
	    
    await wixPaidPlans.getCurrentMemberOrders() //get order or plans
        // Display orders in a table
        .then((ordersn) => {
            orders = ordersn;
            console.log(orders);
        })
        .catch((err) => {
            console.log(err);
        });

    let plans = [];
    for (let a = 0; a < orders.length; a++) { //Filter Orders by active status
        if (orders[a].status === "ACTIVE") {
			//IDPLAN "eye catching banner" = d6a54e3d-e9db-4740-8dbe-102825b55ec3
			//prueba = 3f7325a4-5b0f-45dd-9397-b9a3ce1f2dd4
            if(orders[a].planId === "d6a54e3d-e9db-4740-8dbe-102825b55ec3"){
                plans.push({label: orders[a].planName, value: orders[a].id})
                $w("#box1").collapse();
				$w("#group1").expand();
            }
        }
    }
	console.log(plans);
    $w('#dropdown1').options = plans;
})

export function button30_click(event) {
   
    $w("#dataset16").save();
    for (let a = 0; a < orders.length; a++) { //Filter Orders by active status
        console.log(orders[a].id)
        console.log($w('#dropdown1').value)
        if (orders[a].id === $w('#dropdown1').value) {
            let plan = orders[a].planId;
            var dknow = new Date();
            console.log(dknow);
            dknow.setDate(dknow.getDate()+7);           //7 DAYS
            console.log(dknow);

            console.log(plan);
            console.log(dknow);

            $w("#dataset16").setFieldValues({
                "plan": plan,
                "dateFinal": dknow
            })

            cancelOrderPlan(orders[a].id);

            break;
        }
    }
}

function cancelOrderPlan(orderId) {
    wixPaidPlans.cancelOrder(orderId)
    // Additional processing based on cancellation results
    .then (() => {
       console.log("orderCanceled")
    })
    .catch( (err) => {
       console.log("cancelFailed")
    });
}