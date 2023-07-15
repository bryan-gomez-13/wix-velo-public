import { checkout } from 'wix-pricing-plans';
import { currentMember, authentication } from 'wix-members';
import wixLocation from 'wix-location';
import { orders } from 'wix-pricing-plans';
import { insertMembership } from 'backend/data.jsw'

var privateId = "",
    plans = []

$w.onReady(async function () {
    await memberInfo();
    if (privateId !== "") await getCurrentPlans();
    await filterDataSet();

    authentication.onLogin(async (member) => {
        await memberInfo();
        await getCurrentPlans();
    });
});

function filterDataSet() {
    $w('#dataCoherence').onReady(async () => {
        await $w('#repeater4').onItemReady(($item, itemData) => {
            //console.log(itemData)
            let number = itemData.plan.tagline.split(' ');
            itemData.number = number[0];

            let benefits = "";
            itemData.plan.benefits.sort();
            for (let i = 0; i < itemData.plan.benefits.length; i++) {
                if (i == 0) benefits += itemData.plan.benefits[i]
                else benefits += "\n" + itemData.plan.benefits[i]
            }
            $item('#cohBenefits').text = benefits;

            if (privateId !== "") {
                if (plans.includes(itemData.plan.roleId)) {
                    $item('#currentCH').show();
                    $item('#plan').disable();
                }
            }

            $item('#cohNSections').text = number[0];
            $item('#cohPrice').html = '<h5 class="wixui-rich-text__text" style="font-size:27px; text-align:center;"><span class="color_11 wixui-rich-text__text"><span style="font-weight:bold;" class="wixui-rich-text__text"><span style="font-size:27px;" class="wixui-rich-text__text">$' + itemData.plan.price + '</span><span style="font-size:17px;" class="wixui-rich-text__text">' + itemData.plan.currency + '</span></span></span></span></h5>'
            $item('#plan').onClick(() => checkOut(itemData));
        })
        $w('#box3').show();
    })

    $w('#dataYou').onReady(async () => {
        await $w('#repeater5').onItemReady(($item, itemData) => {
            //console.log(itemData)
            let number = itemData.plan.tagline.split(' ');
            itemData.number = number[0];

            let benefits = "";
            itemData.plan.benefits.sort();
            for (let i = 0; i < itemData.plan.benefits.length; i++) {
                if (i == 0) benefits += itemData.plan.benefits[i]
                else benefits += "\n" + itemData.plan.benefits[i]
            }
            $item('#yBenefits').text = benefits;

            if (plans.includes(itemData.plan.roleId)) {
                $item('#currentY').show();
                $item('#plan2').disable();
            }

            $item('#youNSections').text = number[0];
            $item('#youPrice').html = '<h5 class="wixui-rich-text__text" style="font-size:27px; text-align:center;"><span class="color_11 wixui-rich-text__text"><span style="font-weight:bold;" class="wixui-rich-text__text"><span style="font-size:27px;" class="wixui-rich-text__text">$' + itemData.plan.price + '</span><span style="font-size:17px;" class="wixui-rich-text__text">' + itemData.plan.currency + '</span></span></span></span></h5>'
            $item('#plan2').onClick(() => checkOut(itemData));
        })
        $w('#box5').show();
    })
}

async function memberInfo() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options)
        .then((member) => {
            if (member._id) privateId = member._id;
        }).catch((error) => console.error(error));
}

function checkOut(plan) {
    if (authentication.loggedIn()) {
        console.log("plan")
        checkout.startOnlinePurchase(plan.plan._id)
            .then(async (purchasedOrder) => {
                //console.log(purchasedOrder)
                //console.log('Success! Created order:', purchasedOrder);
                let result = await insertMembership(plan, purchasedOrder, privateId, purchasedOrder.order._id)
                //console.log(result)
                wixLocation.to('/booking-v2')
            }).catch((error) => console.error(error))
    } else {
        $w('#undefinedDAC1023').text = "Do login to buy membership"
        $w('#undefinedDAC1023').scrollTo();
        setTimeout(() => {
            let options = {
                mode: 'login',
                modal: true
            }
            $w('#undefinedDAC1023').text = "Memberships"
            authentication.promptLogin(options)
        }, 2000);

    }
}

async function getCurrentPlans() {
    await orders.listCurrentMemberOrders()
        .then(async (ordersList) => {
            for (let i = 0; i < ordersList.length; i++) {
                if (ordersList[i].status == "ACTIVE") plans.push(ordersList[i].planId)
            }
            //console.log(plans)
        }).catch((error) => console.error(error));
}