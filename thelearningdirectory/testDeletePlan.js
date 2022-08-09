import wixPaidPlans from 'wix-paid-plans';

$w.onReady(async function () {
    getPlans();
});

async function getPlans() {
    await wixPaidPlans.getCurrentMemberOrders()
        .then(async orders => {
            console.log(orders)
            let dateNow = new Date();
            //let currentDate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
            let currentDate = '2022-6-14'
            //console.log(currentDate)
            for (let i = 0; i < orders.length; i++) {
                let datePlan = orders[i].dateCreated.getFullYear() + '-' + (orders[i].dateCreated.getMonth() + 1) + '-' + orders[i].dateCreated.getDate()
                //console.log(datePlan)
                console.log(orders[i].planName == 'free promo', orders[i].status == 'ACTIVE', (!(datePlan == currentDate)))
                if ((orders[i].planName == 'free promo') && (orders[i].status == 'ACTIVE') && (!(datePlan == currentDate))) {
                    console.log('Cancel',orders[i].id)
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