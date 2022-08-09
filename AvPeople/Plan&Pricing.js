import wixPaidPlans from 'wix-paid-plans';

$w.onReady(async function () {
    getPlans();
});

async function getPlans() {
    await wixPaidPlans.getCurrentMemberOrders()
        .then(async orders => {
            console.log(orders)
            let dateNow = new Date();
            let currentDate = dateNow.toDateString();
            //let currentDate = 'Thu Jun 16 2022'
            for (let i = 0; i < orders.length; i++) {
                let datePlan = orders[i].dateCreated.toDateString();
                if ( (orders[i].planName == 'Day - Test') && (orders[i].status == 'ACTIVE') && (!(datePlan == currentDate))) {
                    console.log(orders[i].id)
                    await wixPaidPlans.cancelOrder(orders[i].id)
                        .then(() => {
                            console.log("Done")
                        })
                        .catch((err) => {
                            console.log(err)
                        });
                }
            }
        }).catch((err) => {
            console.log(err);
        });
}