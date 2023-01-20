import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { checkout } from 'wix-pricing-plans';

$w.onReady(function () {
    getPlans();
	init();
});

function init() {
	$w('#new').onClick(() => payPlan("611b7feb-4130-4619-a752-7d250665c1db"))
	$w('#mainstream').onClick(() => payPlan("d0163d2a-8ecc-447e-b47b-566883b66f77"))
	$w('#international').onClick(() => payPlan("3d58a6c9-4240-4257-96dc-907ef70fc6b5"))
}

function getPlans() {
    wixData.query("PaidPlans/Plans").find()
        .then((results) => {
			console.log(results.items)
            for (let i = 0; i < results.items.length; i++) {
                if (results.items[i]._id == "611b7feb-4130-4619-a752-7d250665c1db") $w('#new').label = results.items[i].name
                else if (results.items[i]._id == "d0163d2a-8ecc-447e-b47b-566883b66f77") $w('#mainstream').label = results.items[i].name
                else if (results.items[i]._id == "3d58a6c9-4240-4257-96dc-907ef70fc6b5") $w('#international').label = results.items[i].name
            }
        }).catch((err) => console.log(err));
}

function payPlan(planId) {
    checkout.startOnlinePurchase(planId)
        .then((purchasedOrder) => {
			if(purchasedOrder.wixPayStatus == "Successful") wixLocation.to('/applicant-form')
			else {
				console.log(purchasedOrder)
				$w('#message').text = purchasedOrder.wixPayStatus
				$w('#message').show()
			}
        })
        .catch((error) => console.error(error))
}