import wixPaidPlans from 'wix-paid-plans';
import wixData from 'wix-data';
import {eMail} from 'backend/email'

var orders = [];
var plansarray = [];
var Image = null;

$w.onReady(async function () {
    init();
    await getPlans();
});

function init() {
    $w('#picture').onChange(() => uploadPicture());
    $w('#plans').onChange(() => plans());
    $w('#selectPage').onChange(() => getAvailablePlans());
    $w('#submit').onClick(() => submit());
}

// ========================================= GET PLANS BY EACH MEMBER =========================================
async function getPlans() {
    await wixPaidPlans.getCurrentMemberOrders() //get order or plans
        .then((ordersn) => {
            orders = ordersn;
            //console.log(orders);
        })
        .catch((err) => {
            console.log(err);
        });

    let plans = [];
    for (let a = 0; a < orders.length; a++) { //Filter Orders by active status
        if (orders[a].status === "ACTIVE") {
            if (orders[a].planId === "35c5446a-e010-465f-9cee-891589d9b0b5" || orders[a].planId === "503c93c5-3e7c-44e4-8d7c-690feb81bce8") {
                if (orders[a].planId === "503c93c5-3e7c-44e4-8d7c-690feb81bce8") {
                    plansarray.push(orders[a].id)
                }
                plans.push({ label: orders[a].planName, value: orders[a].id })
                $w("#statebox8").changeState('AddBanner');
            } else {
                $w("#statebox8").changeState('Message');
            }
        }
    }
    //console.log(plans);
    $w('#plans').options = plans;
}

function plans() {
    if (plansarray.includes($w('#plans').value)) $w('#selectPage').expand();
    else {
        $w('#selectPage').collapse();
        getAvailablePlans(0);
    }
}

function getAvailablePlans(plan) {
    if (plan == 0) {
        queryPlan('allCourses')
    } else {
        switch ($w('#selectPage').value) {
        case "Arts And Crafts":
            queryPlan('artsAndCrafts')
            break;
        case "Health And Wellbeing":
            queryPlan('healthAndWellbeing')
            break;
        case "News":
            queryPlan('news')
            break;
        case "Youth Programmes":
            queryPlan('youthProgrammes')
            break;
        case "Clubs And Groups":
            queryPlan('clubsAndGroups')
            break;
        }
    }
}

function queryPlan(params) {
    wixData.query("Banner").eq('active', true)
        .and(wixData.query("Banner").eq(params, true))
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w('#textValidation').text = "Message if a page already has a banner"
                $w('#textValidation').expand();
                $w('#textValidation').scrollTo()
            }else{
				$w('#textValidation').collapse();
				$w('#textValidation').text = "Message"
			}
        })
        .catch((err) => {
            console.log(err)
        });
}
// ========================================= PICTURE & DOCUMENT =========================================
async function uploadPicture() {
    $w("#image").src = "https://miro.medium.com/max/296/0*0kRsDyQ0V3rxEzFy.gif";
    if ($w("#picture").value.length > 0) { // user chose a file
        await $w("#picture").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    //console.log(uploadedFile.fileUrl)
                    $w("#image").src = uploadedFile.fileUrl
                    //$w("#image").expand();
                    Image = uploadedFile.fileUrl;
                    $w("#textUpload").collapse();
                })
            })
            .catch((uploadError) => {
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
		let jsonEmail = {
			'Company': $w('#company').value,
			'Name': $w('#Advertiser').value,
			'Email': $w('#email').value,
			'Phone': $w('#phone').value,
		}
        //console.log(json)
        await wixData.insert("Banner", json);
		await eMail(jsonEmail);
        await cancelOrderPlan($w('#plans').value);
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
    if (!$w('#website').valid) throw new Error('Missing Website');
}

// ========================================= CANCEL ORDER =========================================
function cancelOrderPlan(orderId) {
    wixPaidPlans.cancelOrder(orderId)
        // Additional processing based on cancellation results
        .then(() => {
            console.log("Done")
        })
        .catch((err) => {
            console.log(err)
        });
}