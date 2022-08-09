import wixLocation from 'wix-location';
import wixPaidPlans from 'wix-paid-plans';

$w.onReady(function () {
    wixLocation.onChange(() => {
        getPlans();
    });
});

// ========================================= GET PLANS BY EACH MEMBER =========================================
async function getPlans() {
    $w('#text12').collapse();
    wixPaidPlans.getCurrentMemberOrders() //get order or plans
        .then(async (order) => {
            if (wixLocation.url.includes('status')) {
                console.log('OK')

                switch (order[0].planId) {
                    /*
                    //free trial
                case "3f7325a4-5b0f-45dd-9397-b9a3ce1f2dd4":
                    wixLocation.to('/membersarea/add-banner')
                    break;
                    */
                    //clubs and groups
                case "15299fee-3911-44bd-aa3d-382abe70b39e":
                    wixLocation.to('/membersarea/clubs-and-groups')
                    break;
                    //home banner
                case "35c5446a-e010-465f-9cee-891589d9b0b5":
                    wixLocation.to('/membersarea/ad-banner')
                    break;
                    //category banner
                case "503c93c5-3e7c-44e4-8d7c-690feb81bce8":
                    wixLocation.to('/membersarea/ad-banner')
                    break;

                default:
                    wixLocation.to('/')
                    break;
                }
            }
        })
        .catch((err) => {
            console.log(err);
        });
}