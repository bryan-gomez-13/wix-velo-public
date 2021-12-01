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
            if(orders[a].id !== "d6a54e3d-e9db-4740-8dbe-102825b55ec3"){
                plans.push({label: orders[a].planName, value: orders[a].id})
                $w("#box1").hide();
            }
        }
    }
    console.log(plans);
    $w('#dropdown2').options = plans;
})

export function button30_click(event) {
    $w("#dataset17").save();

    for (let a = 0; a < orders.length; a++) { //Filter Orders by active status
        if (orders[a].id === $w('#dropdown2').value) {
            let plan = orders[a].planId;
            var dknow = new Date();
            console.log(dknow);
            //                      FREE launch promo                                   cheap + more cheerfu          
            if((plan === '3f7325a4-5b0f-45dd-9397-b9a3ce1f2dd4') || (plan === '206f9520-8619-468c-90ef-190798511246')){
                dknow.setMonth(dknow.getMonth()+1);         //MONTH
            //                          cheap and cheerful                                  eye catching banner
            }else if((plan === '3bbb3d86-e37d-46e8-b7fe-b2357b08a55c') || (plan === 'd6a54e3d-e9db-4740-8dbe-102825b55ec3')){
                dknow.setDate(dknow.getDate()+7);           //DAYS
            //                              feature it
            }else if(plan === '13b985c8-bef6-454e-90bf-7fb562ff6cb3'){
                dknow.setDate(dknow.getDate()+14);          //DAYS
            }
            
            console.log(dknow);

            $w("#dataset17").setFieldValues({
                "startTime": $w("#timePicker1").value,
                "finalTime": $w("#timePicker2").value,
                "plan": plan,
                "dateFinalCourse": dknow
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