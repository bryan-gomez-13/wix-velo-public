import { orders } from 'wix-pricing-plans-frontend';
import { eMail } from 'backend/email.web.js'

import { cancelOrders } from 'backend/functions.web.js'
import { queryPlan, saveBanner } from 'backend/collections.web.js'

var plansarray = [];
var Image = null;

$w.onReady(async function () {

    init();
    getPlans();
});

function init() {
    $w('#picture').onChange(() => uploadPicture());
    $w('#plans').onChange(() => plans());
    $w('#selectPage').onChange(() => getAvailablePlans());
    $w('#submit').onClick(() => submit());
    $w('#website').onInput(() => websiteValidation());
}

// ========================================= GET PLANS BY EACH MEMBER =========================================
async function getPlans() {
    orders.listCurrentMemberOrders().then((ordersWix) => {
        let plans = [];
        for (let a = 0; a < ordersWix.length; a++) { //Filter ordersWix by active status
            if (ordersWix[a].status === "ACTIVE") {
                if (ordersWix[a].planId === "35c5446a-e010-465f-9cee-891589d9b0b5" || ordersWix[a].planId === "503c93c5-3e7c-44e4-8d7c-690feb81bce8") {
                    if (ordersWix[a].planId === "503c93c5-3e7c-44e4-8d7c-690feb81bce8") {
                        plansarray.push(ordersWix[a]._id)
                    }
                    plans.push({ label: ordersWix[a].planName, value: ordersWix[a]._id })
                    $w("#statebox8").changeState('AddBanner');
                } else {
                    $w("#statebox8").changeState('Message');
                }
            }
        }
        //console.log(plans);
        $w('#plans').options = plans;
    }).catch((err) => { console.log(err) });
}

function plans() {
    if (plansarray.includes($w('#plans').value)) $w('#selectPage').expand();
    else {
        $w('#selectPage').collapse();
        getAvailablePlans(0);
    }
}

function getAvailablePlans(plan) {
    const page = $w('#selectPage').value;
    let field = "";

    if (plan == 0) field = "allCourses";
    else if (page == "Arts And Crafts") field = "artsAndCrafts";
    else if (page == "Health And Wellbeing") field = "healthAndWellbeing";
    else if (page == "News") field = "news";
    else if (page == "Youth Programmes") field = "youthProgrammes";
    else if (page == "Clubs And Groups") field = "clubsAndGroups";

    queryPlan(field).then((result) => {
        if (result.status) {
            $w('#text33').expand();
            $w('#text33').text = "We're sorry, this banner space is currently utilised.\nPlease select a banner on another page or email us for availability on contact@linkandlearn.nz"
        } else {
            $w('#text33').collapse();
            $w('#text33').text = "Message"
        }
    })

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
// ========================================= SUBMIT =========================================
async function submit() {
    $w('#textValidation').collapse();
    $w('#submit').disable();
    try {

        checkValidation();
        let jsonPage = await pageValidation();

        let json = {
            'title': $w('#Advertiser').value,
            'image': Image,
            'contactNameClients': $w('#company').value,
            'emailClients': $w('#email').value,
            'phoneL': $w('#phone').value,
            'link': $w('#website').value,
            'clicks': 0,
            'allCourses': jsonPage.v0,
            'artsAndCrafts': jsonPage.v1,
            'healthAndWellbeing': jsonPage.v2,
            'news': jsonPage.v3,
            'youthProgrammes': jsonPage.v4,
            'clubsAndGroups': jsonPage.v5,
        }
        //console.log(json)
        saveBanner(json).then(async (bannerID) => {
            let jsonEmail = {
                'Page': $w('#selectPage').value,
                'Company': $w('#company').value,
                'Name': $w('#Advertiser').value,
                'Email': $w('#email').value,
                'Phone': $w('#phone').value,
                'link': "https://manage.wix.com/dashboard/f9b17bd2-6ab9-4769-8731-eff2085a1b1f/database/data/Banner/" + bannerID
            }
            await eMail(jsonEmail);
        })

        await cancelOrders($w('#plans').value);
        $w('#statebox8').scrollTo();
        $w('#statebox8').changeState('ThankYou')

    } catch (err) {
        $w('#textValidation').text = err.message;
        $w('#textValidation').expand();
        $w('#submit').enable();
    }
}

function pageValidation() {
    let json
    switch ($w('#selectPage').value) {
    case "Arts And Crafts":
        json = {
            'v0': false,
            'v1': true,
            'v2': false,
            'v3': false,
            'v4': false,
            'v5': false,
        }
        break;
    case "Health And Wellbeing":
        json = {
            'v0': false,
            'v1': false,
            'v2': true,
            'v3': false,
            'v4': false,
            'v5': false,
        }
        break;
    case "News":
        json = {
            'v0': false,
            'v1': false,
            'v2': false,
            'v3': true,
            'v4': false,
            'v5': false,
        }
        break;
    case "Youth Programmes":
        json = {
            'v0': false,
            'v1': false,
            'v2': false,
            'v3': false,
            'v4': true,
            'v5': false,
        }
        break;
    case "Clubs And Groups":
        json = {
            'v0': false,
            'v1': false,
            'v2': false,
            'v3': false,
            'v4': false,
            'v5': true,
        }
        break;
    default:
        json = {
            'v0': true,
            'v1': false,
            'v2': false,
            'v3': false,
            'v4': false,
            'v5': false,
        }
        break;
    }
    return json;
}

function checkValidation() {
    if (!($w("#picture").value.length > 0)) throw new Error('Missing Picture');
    if (plansarray.includes($w('#plans').value))
        if (!$w('#selectPage').valid) throw new Error('Missing Page of the banner');
    if (!$w('#company').valid) throw new Error('Missing Company');
    if (!$w('#Advertiser').valid) throw new Error('Missing Advertiser');
    if (!$w('#email').valid) throw new Error('Missing Email');
    if (!$w('#phone').valid) throw new Error('Missing Phone');
    if (!$w('#website').valid) throw new Error('Please input complete URL including https://');
}

function websiteValidation() {
    if ($w('#website').valid) {
        $w('#textValidation').collapse();
        $w('#submit').enable()
    } else {
        $w('#textValidation').text = 'Please input complete URL including https://';
        $w('#textValidation').expand();
        $w('#submit').disable();
    }
}