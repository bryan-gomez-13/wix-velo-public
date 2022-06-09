import wixLocation from 'wix-location';
import wixPaidPlans from 'wix-paid-plans';

$w.onReady(function () {
    wixLocation.onChange(() => {
        $w('#membershipPlanPickerTpa1').collapse();
        getPlans();
    });
});

// ========================================= GET PLANS BY EACH MEMBER =========================================
async function getPlans() {
    await wixPaidPlans.getCurrentMemberOrders() //get order or plans
        .then(async (order) => {
            switch (order[0].planId) {
            case "15299fee-3911-44bd-aa3d-382abe70b39e":
				wixLocation.to('/membersarea/clubs-and-groups')
                break;

            case "35c5446a-e010-465f-9cee-891589d9b0b5":
				wixLocation.to('/membersarea/add-banner')
                break;

            case "503c93c5-3e7c-44e4-8d7c-690feb81bce8":
				wixLocation.to('/membersarea/add-banner')
                break;

            default:
				wixLocation.to('/')
                break;
            }
        })
        .catch((err) => {
            console.log(err);
        });
}