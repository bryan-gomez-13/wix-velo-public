import { currentMember, authentication } from 'wix-members';
import { orders } from 'wix-pricing-plans';

var privateId = "",
    plans = []

$w.onReady(async function () {
    await memberInfo();
    if (privateId !== "") await getCurrentPlans();

    authentication.onLogin(async (member) => {
        await memberInfo();
        await getCurrentPlans();
    });
});

async function memberInfo() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options)
        .then((member) => {
            if (member) privateId = member._id;
        }).catch((error) => console.error(error));
}

async function getCurrentPlans() {
    await orders.listCurrentMemberOrders()
        .then(async (ordersList) => {
            for (let i = 0; i < ordersList.length; i++) {
                if (ordersList[i].status == "ACTIVE") {
                    if (ordersList[i].planId == "70fa5386-2d93-4646-b131-6e8774e60514") $w('#ch14').expand(), $w('#ch14D').collapse();
                    if (ordersList[i].planId == "6d87f421-244f-4cfb-9021-23fcc596c70e") $w('#ch24').expand(), $w('#ch24D').collapse();
                    if (ordersList[i].planId == "158abb1f-0252-4f06-92b1-5c182999279c") $w('#you2').expand(), $w('#you2D').collapse();
                }
            }
            console.log("plans", plans)
        }).catch((error) => console.error(error));
}