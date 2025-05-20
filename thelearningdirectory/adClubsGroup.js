import { orders } from 'wix-pricing-plans-frontend';

import { eMailClubs } from 'backend/email.web.js'
import { cancelOrders } from 'backend/functions.web.js'
import { saveClubsAndGroups } from 'backend/collections.web.js'

var Image = null;

$w.onReady(async function () {
    init();
    getPlans();
});

function init() {
    $w('#picture').onChange(() => uploadPicture());
    $w('#submit').onClick(() => submit());
}
// ========================================= GET PLANS BY EACH MEMBER =========================================
function getPlans() {
    orders.listCurrentMemberOrders().then((ordersWix) => {
        console.log("ordersWix", ordersWix);
        let plans = [];
        for (let a = 0; a < ordersWix.length; a++) { //Filter ordersWix by active status
            if (ordersWix[a].status === "ACTIVE") {
                if (ordersWix[a].planId === "15299fee-3911-44bd-aa3d-382abe70b39e" || ordersWix[a].planId === "655a38d8-cdb8-4bbb-8efc-77779b6c2db5") {
                    plans.push({ label: ordersWix[a].planName, value: ordersWix[a]._id })
                    $w("#statebox8").changeState('CreateNew');
                }
            }
        }
        if (plans.length == 0) $w('#selectPackage').show();
        $w('#plans').options = plans;
    }).catch((err) => { console.log(err) });

}

// ========================================= PICTURE & DOCUMENT =========================================
async function uploadPicture() {
    $w("#image").src = "https://miro.medium.com/max/296/0*0kRsDyQ0V3rxEzFy.gif";
    if ($w("#picture").value.length > 0) { // user chose a file
        $w("#picture").uploadFiles().then((uploadedFiles) => {
            uploadedFiles.forEach(uploadedFile => {
                $w('#size').text = "Width " + uploadedFile.width + " Heigh " + uploadedFile.height
                $w('#size').expand()
                $w("#image").src = uploadedFile.fileUrl
                //$w("#image").expand();
                Image = uploadedFile.fileUrl;
                $w("#textUpload").collapse();
            })
        }).catch((uploadError) => {
            $w("#textUpload").text = "Error: " + uploadError.errorDescription;
            $w("#textUpload").expand();
        });
    } else { // user clicked button but didn't chose a file
        $w("#textUpload").text = "Please choose a file to upload.";
        $w("#textUpload").expand();
    }
}

async function submit() {
    $w('#textValidation').collapse();
    $w('#submit').disable();
    try {
        checkValidation();
        let json = {
            'title': $w('#name').value,
            'image': Image,
            'email': $w('#email').value,
            'phone': $w('#phone').value,
            'website': $w('#website').value,
            'shortDescription': $w('#shortDescription').value,
            'longDescription': $w('#longDescription').value,
            'location': $w('#location').value,
        }

        saveClubsAndGroups(json).then(async (clubsId) => {
            let jsonEmail = {
                'Name': $w('#name').value,
                'Email': $w('#email').value,
                'Phone': $w('#phone').value,
                'Website': $w('#website').value,
                'link': 'https://manage.wix.com/dashboard/f9b17bd2-6ab9-4769-8731-eff2085a1b1f/database/data/ClubsandCommunity/' + clubsId
            }
            await eMailClubs(jsonEmail);
        });

        await cancelOrders($w('#plans').value);
        $w('#statebox8').scrollTo();
        $w('#statebox8').changeState('ThankYou')

    } catch (err) {
        $w('#textValidation').text = err.message;
        $w('#textValidation').expand();
        $w('#submit').enable();
    }
}

function checkValidation() {
    if (!($w("#picture").value.length > 0)) throw new Error('Missing Picture');
    if (!$w('#plans').valid) throw new Error('Missing Plan');
    if (!$w('#name').valid) throw new Error('Missing Name');
    if (!$w('#email').valid) throw new Error('Missing Email');
    if (!$w('#phone').valid) throw new Error('Missing Phone');
}