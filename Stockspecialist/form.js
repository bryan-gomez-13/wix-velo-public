import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { checkout } from 'wix-pricing-plans';

$w.onReady(function () {
    $w('#wixForms1').onWixFormSubmitted((form) => {
        let fields = form.fields
        console.log(fields)
        checkout.startOnlinePurchase("cbba2893-6992-4693-b400-a63338f2cada")
            .then((purchasedOrder) => {
                let result = purchasedOrder
                console.log(result)
                if (purchasedOrder.wixPayStatus == "Successful") {
                    wixData.query('jobApplication05').eq('email', fields[0].fieldValue).and(wixData.query('jobApplication05').eq('phone', fields[4].fieldValue)).descending('_createdDate').find().then((user) => {
                        let item = user.items[0]
                        item.privateId = result.order.buyer.memberId
                        item.planName = result.order.planName
                        item.amount = result.order.planPrice
                        item.status = result.wixPayStatus

                        wixData.update('jobApplication05', item).then(() => wixLocation.to('/'))
                    })
                } else {
                    console.log(purchasedOrder)
                    $w('#message').text = purchasedOrder.wixPayStatus
                    $w('#message').show()
                }
            })
            .catch((error) => console.error(error))
    })
    //cbba2893-6992-4693-b400-a63338f2cada
});