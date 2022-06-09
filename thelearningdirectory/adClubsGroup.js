import wixPaidPlans from 'wix-paid-plans';
import wixData from 'wix-data';

var orders = [];
var Image = null;

$w.onReady(async function () {
    init();
    await getPlans();
});

function init() {
    $w('#picture').onChange(() => uploadPicture());
    $w('#submit').onClick(() => submit());
}
// ========================================= GET PLANS BY EACH MEMBER =========================================
async function getPlans() {
    await wixPaidPlans.getCurrentMemberOrders() //get order or plans
        .then((ordersn) => {
            orders = ordersn;
            console.log(orders);
        })
        .catch((err) => {
            console.log(err);
        });

    let plans = [];
    for (let a = 0; a < orders.length; a++) { //Filter Orders by active status
        if (orders[a].status === "ACTIVE") {
            if (orders[a].planId === "15299fee-3911-44bd-aa3d-382abe70b39e") {
                plans.push({ label: orders[a].planName, value: orders[a].id })
                $w("#statebox8").changeState('CreateNew');
                break;
            } else {
                $w("#statebox8").changeState('Message');
            }
        }
    }
    //console.log(plans);
    $w('#plans').options = plans;
}

// ========================================= PICTURE & DOCUMENT =========================================
async function uploadPicture() {
    $w("#image").src = "https://miro.medium.com/max/296/0*0kRsDyQ0V3rxEzFy.gif";
    if ($w("#picture").value.length > 0) { // user chose a file
        await $w("#picture").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    //console.log(uploadedFile.fileUrl)
                    console.log(uploadedFile)
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

async function submit() {
    $w('#textValidation').collapse();
    $w('#submit').disable();
    try {

        checkValidation();
        //let date = new Date($w('#date').value.getFullYear()+","+ ($w('#date').value.getMonth()+1)+","+$w('#date').value.getUTCDate()+","+ $w('#hour').value.toString())
        //console.log($w('#articleText').value)

        let json = {
            'title': $w('#name').value,
            'image': Image,
            'email': $w('#email').value,
            'phone': $w('#phone').value,
            'website': $w('#website').value,
            'shortDescription': $w('#shortDescription').value,
            'location': $w('#location').value,
        }

        //console.log(json)
        await wixData.insert("ClubsandCommunity", json);
        await cancelOrderPlan($w('#plans').value);
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
    //if (!$w('#website').valid) throw new Error('Missing Website');
    /*
    try {
        let address = $w('#location').value.formatted.split(',')
        if (!(address.length > 1)) throw new Error('Select Location');
    } catch (error) {
        throw new Error('Select Location');
    }
    */
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