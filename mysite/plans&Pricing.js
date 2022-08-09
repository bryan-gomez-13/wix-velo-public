import wixPaidPlans from 'wix-paid-plans';

$w.onReady(async function () {
    getPlans();
});

async function getPlans() {
    await wixPaidPlans.getCurrentMemberOrders()
        .then(async orders => {
            console.log(orders)
            let dateNow = new Date();
            //let currentDate = dateNow.toDateString();
            let currentDate = '2022-6-14'
            for (let i = 0; i < orders.length; i++) {
                let datePlan = orders[i].dateCreated.toDateString()
                console.log(i)
                if ((orders[i].planName == 'Day pass') && (orders[i].status == 'ACTIVE') && (!(datePlan == currentDate))) {
                    await wixPaidPlans.cancelOrder(orders[i].id)
                        .then(() => {
                            console.log("Done")
                        })
                        .catch((err) => {
                            console.log(err)
                        });
                } else {
                    console.log(i, 'Plan available')
                }
            }
        }).catch((err) => {
            console.log(err);
        });
}