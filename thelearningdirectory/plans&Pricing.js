import { orders } from 'wix-pricing-plans-frontend';
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(function () {
    wixLocationFrontend.onChange(() => {
        if (wixLocationFrontend.url.includes('status')) getPlans();
        if (wixLocationFrontend.url.includes('payment')) $w('#g1').collapse(), $w('#g2').collapse();
    });
});

// ========================================= GET PLANS BY EACH MEMBER =========================================
async function getPlans() {
    $w('#text12').collapse();
    orders.listCurrentMemberOrders().then(async (order) => {
            //console.log("order", order)
            if (wixLocationFrontend.url.includes('status')) {
                $w('#membershipPlanPickerTpa1').collapse();
                $w('#box1').expand();
                //console.log('OK')

                switch (order[0].planId) {
                    //free trial
                case "3f7325a4-5b0f-45dd-9397-b9a3ce1f2dd4":
                    wixLocationFrontend.to('/post-an-ad')
                    break;

                    //standard ad - start date	3bbb3d86-e37d-46e8-b7fe-b2357b08a55c
                case "3bbb3d86-e37d-46e8-b7fe-b2357b08a55c":
                    wixLocationFrontend.to('/post-an-ad')
                    break;

                    //standard ad- by appointment	206f9520-8619-468c-90ef-190798511246
                case "206f9520-8619-468c-90ef-190798511246":
                    wixLocationFrontend.to('/post-an-ad')
                    break;

                    //clubs and groups
                case "15299fee-3911-44bd-aa3d-382abe70b39e":
                    wixLocationFrontend.to('/ad-clubs-and-groups')
                    break;

                case "655a38d8-cdb8-4bbb-8efc-77779b6c2db5":
                    wixLocationFrontend.to('/ad-clubs-and-groups')
                    break;
                    //home banner
                case "35c5446a-e010-465f-9cee-891589d9b0b5":
                    wixLocationFrontend.to('/ad-banner')
                    break;
                    //category banner
                case "503c93c5-3e7c-44e4-8d7c-690feb81bce8":
                    wixLocationFrontend.to('/ad-banner')
                    break;

                default:
                    wixLocationFrontend.to('/')
                    break;
                }
            }
        })
        .catch((err) => {
            console.log(err);
        });
}