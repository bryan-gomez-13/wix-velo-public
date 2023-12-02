import { orders } from 'wix-pricing-plans';

$w.onReady(function () {
    getPlans();
});

async function getPlans() {
    await orders.listCurrentMemberOrders()
        .then(async (ordersList) => {
            let ch14P = ['70fa5386-2d93-4646-b131-6e8774e60514'];
            let x = true;
            for (let i = 0; i < ordersList.length; i++) {
                if (ordersList[i].status == "ACTIVE" && ch14P.includes(ordersList[i].planId)) {
                    $w('#section1').expand(), $w('#section2').collapse();
                    x = false;
                    break;
                }
            }
            if (x) $w('#boxMember').show();
        }).catch(async (error) => console.error(error));
}