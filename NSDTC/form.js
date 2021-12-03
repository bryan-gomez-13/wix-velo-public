import { appendValuesWrapper, updateValuesWrapper } from 'backend/googlesheet-wrapper.jsw';
import wixData from 'wix-data';
import { Email_Life_Member, Email_New_Member, Email_Renewal } from 'backend/emails.jsw';
import { createMyPayment } from 'backend/pay';
import { doRegistration } from 'backend/signIn.jsw';
import wixPay from 'wix-pay';
import wixLocation from 'wix-location';

var total = null;
var rowInGoogleSheet = 0;
let name = "";

$w.onReady(function () {
    $w('#BOne').disable();
});

export function Question1_change(event) {
    change();
}

export function Question2_change(event) {
    change();

    if ($w('#indicateMembership').value != "") {
        dateRadioNoNo();
    }
}

//================================== Questions ==================================
export function change() {
    let first = $w('#Question1').value;
    let Second = $w('#Question2').value;

    if (first == "Yes") {
        FormYes();
        $w('#L0').collapse();
        $w('#Question2').collapse();

        //Five screen
        $w('#boxNo').collapse();
        //$w('#text22').text = "Thanks for submitting. Our representatives will get in touch with you.";

        //$w('#text29').expand();
        $w('#text31').collapse();

        $w('#End').label = 'Submit >';

    } else {
        $w('#Question2').expand();
        $w('#BOne').disable();
        $w('#L0').expand();

        //Five screen
        $w('#boxNo').expand();
        //$w('#text22').text = "The last step is pay your subscription for finish";

        $w('#text31').expand();

        $w('#End').label = 'Next >';

        if (Second == "Yes") {
            FormNoYes();
        } else if (Second == "No") {
            FormNoNo();
        }
    }
}
//================================== Yes ==================================
export function FormYes() {
    //First screen
    $w('#BOne').enable();

    //Second screen
    //$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
    radioB("Yes");

    //Third screen
    dogs();

}
//================================== No - Yes ==================================
export function FormNoYes() {
    //First screen
    $w('#BOne').enable();

    //Second screen
    //$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
    radioB("No");

    //Third screen
    dogs();
}
//================================== No - No ==================================
export function FormNoNo() {
    //First screen
    $w('#BOne').enable();

    //Second screen
    //$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
    radioB("No");

    //Third screen
    dogs();
}

//================================== Radio Button ==================================
export function radioB(value) {
    wixData.query("RadioButton")
        .ascending("_createdDate")
        .find()
        .then((results) => {
            //console.log(results);
            let op = [];
            if (value == "Yes") {
                op.push({ label: results.items[0].title, value: results.items[0].title })
                op.push({ label: results.items[1].title, value: results.items[1].title })
            } else {
                op.push({ label: results.items[0].title, value: results.items[0].title })
                op.push({ label: results.items[2].title, value: results.items[2].title })
            }

            $w('#indicateMembership').options = op;
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

//================================== Dog's activities ==================================
export function dogs() {
    wixData.query("Activities")
        .ascending("order")
        .find()
        .then((results) => {
            //console.log(results);
            let activities = [];
            for (let i = 0; i < results.items.length; i++) {
                activities.push({ label: results.items[i].title, value: results.items[i].title })
            }
            $w('#D1Activities').options = activities;
            $w('#D2Activities').options = activities;
            $w('#D3Activities').options = activities;
            $w('#D4Activities').options = activities;
            $w('#D5Activities').options = activities;
            $w('#D6Activities').options = activities;
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

/// ==================== Dogs form ====================
export function add2_click(event) {
    $w('#add2').collapse();
    $w('#remove2').expand();
    $w('#D2Name').expand();
    $w('#D2Activities').expand();

    if ($w('#D3Name').isVisible == false) {
        $w('#add3').expand();
    }
}

export function remove2_click(event) {
    $w('#add2').expand();
    $w('#remove2').collapse();
    $w('#D2Name').collapse();
    $w('#D2Activities').collapse();

    $w('#D2Name').value = "";
    dog2Field();
}

export function add3_click(event) {
    $w('#add3').collapse();
    $w('#remove3').expand();
    $w('#D3Name').expand();
    $w('#D3Activities').expand();

    if ($w('#D4Name').isVisible == false) {
        $w('#add4').expand();
    }
}

export function remove3_click(event) {
    $w('#add3').expand();
    $w('#remove3').collapse();
    $w('#D3Name').collapse();
    $w('#D3Activities').collapse();

    $w('#D3Name').value = "";
    dog3Field();
}

export function add4_click(event) {
    $w('#add4').collapse();
    $w('#remove4').expand();
    $w('#D4Name').expand();
    $w('#D4Activities').expand();
    //Get field of the radio button 
    let x = $w('#indicateMembership').value;

    if ($w('#D5Name').isVisible == false && x.includes("Family")) {
        $w('#add5').expand();
    }
}

export function remove4_click(event) {
    $w('#add4').expand();
    $w('#remove4').collapse();
    $w('#D4Name').collapse();
    $w('#D4Activities').collapse();

    $w('#D4Name').value = "";
    dog4Field();
}

export function add5_click(event) {
    $w('#add5').collapse();
    $w('#remove5').expand();
    $w('#D5Name').expand();
    $w('#D5Activities').expand();

    if ($w('#D6Name').isVisible == false) {
        $w('#add6').expand();
    }
}

export function remove5_click(event) {
    $w('#add5').expand();
    $w('#remove5').collapse();
    $w('#D5Name').collapse();
    $w('#D5Activities').collapse();

    $w('#D5Name').value = "";
    dog5Field();
}

export function add6_click(event) {
    $w('#add6').collapse();
    $w('#remove6').expand();
    $w('#D6Name').expand();
    $w('#D6Activities').expand();
}

export function remove6_click(event) {
    $w('#add6').expand();
    $w('#remove6').collapse();
    $w('#D6Name').collapse();
    $w('#D6Activities').collapse();

    $w('#D6Name').value = "";
    dog6Field();
}

/// ==================== Dogs Field ====================
// Dog1
export function dog1Field() {
    let name = $w('#D1Name').value;
    let activities = $w('#D1Activities').value;
    $w('#Dog1').value = name + " - " + activities;
    console.log($w('#Dog1').value);
}

//Dog2
export function dog2Field() {
    $w('#Dog2').value = "";
    if ($w('#D2Name').value != "") {
        $w('#Dog2').value = $w('#D2Name').value + " - " + $w('#D2Activities').value;
    }
    console.log($w('#Dog2').value);
}

//Dog3
export function dog3Field() {
    $w('#Dog3').value = "";
    if ($w('#D3Name').value != "") {
        $w('#Dog3').value = $w('#D3Name').value + " - " + $w('#D3Activities').value;
    }
    console.log($w('#Dog3').value);
}

//Dog4
export function dog4Field() {
    $w('#Dog4').value = "";
    if ($w('#D4Name').value != "") {
        $w('#Dog4').value = $w('#D4Name').value + " - " + $w('#D4Activities').value;
    }
    console.log($w('#Dog4').value);
}

//Dog5
export function dog5Field() {
    $w('#Dog5').value = "";
    if ($w('#D5Name').value != "") {
        $w('#Dog5').value = $w('#D5Name').value + " - " + $w('#D5Activities').value;
    }
    console.log($w('#Dog5').value);
}

//Dog6
export function dog6Field() {
    $w('#Dog6').value = "";
    if ($w('#D6Name').value != "") {
        $w('#Dog6').value = $w('#D6Name').value + " - " + $w('#D6Activities').value;
    }
    console.log($w('#Dog6').value);
}

/// ==================== Date ====================

export async function dateSubscription() {
    let dnow = new Date().getMonth();
    //console.log('MONTH')
    //console.log(dnow);
    let total = null;
    let radioButton = $w('#indicateMembership').value;
    await wixData.query("Fees")
        .ascending('_createdDate')
        .find()
        .then(async (results) => {
            for (let i = 0; i < results.length; i++) {

                let firstMonth = await results.items[i].startOfDate.getMonth();
                let secondMonth = await results.items[i].endOfDate.getMonth();
                //console.log(results.items[i].startOfDate + '	'+results.items[i].endOfDate)
                //console.log(firstMonth + '	'+ secondMonth);

                if (dnow >= firstMonth && dnow <= secondMonth) {
                    if (radioButton == "Individual") {
                        total = results.items[i].individual;
                        let text = "Individual $" + total;
                        name = "Individual";
                        $w('#pricingDetails').text = text;
                    } else {
                        total = results.items[i].family;
                        let text = "Family $" + total;
                        name = "Family";
                        $w('#pricingDetails').text = text;
                    }
                    break;
                }
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
    return total;
}

export async function dateRadioNoNo(event) {
    let question1 = $w('#Question1').value;
    let question2 = $w('#Question2').value;
    let radioB = $w('#indicateMembership').value;
    let text = "";

    if (radioB == "Individual") $w('#L0').collapse();
    else $w('#L0').expand();

    if (question1 == "No") {
        if (question2 == "No") {
            total = await dateSubscription();
        } else {
            if (radioB == "Individual") {
                total = 95;
                text = "Individual $" + total;
                name = "Individual";
                $w('#L0').collapse();
            } else {
                total = 140;
                text = "Family $" + total;
                name = "Family";
                $w('#L0').expand();
            }
            $w('#pricingDetails').text = text;
        }
    }
    $w('#totalPrice').text = "$" + total;
    console.log(total);
}

export function pay(event) {
    // Step 2 - Call backend function. 
    // (Next, see step 3 in the backend code below.)
    createMyPayment(name, total)
        // When the payment has been created and a paymentId has been returned:
        .then((payment) => {
            // Step 5 - Call the startPayment() function with the paymentId.
            // Include PaymentOptions to customize the payment experience.
            wixPay.startPayment(payment.id, {
                    "showThankYouPage": false,
                    //"termsAndConditionsLink": "https://davidcamachob.wixsite.com/nsdt/contact-nsdtc"
                })
                // Step 6 - Visitor enters the payment information.
                // When the payment form is completed:
                .then(async (result) => {
                    // Step 7 - Handle the payment result.
                    // (Next, see step 8 in the backend code below.)
                    //$w('#button26').enable();
                    let payment = "";
                    if (result.status === "Successful") {
                        $w('#bookButton').collapse();
                        $w('#text35').expand();

                        let date = new Date()
                        await getEmail(date.toDateString(), 'Successful')

                        payment = "Paid";
                        updateValuesOnSheet(payment);
                    } else if (result.status === "Pending") {
                        payment = "Pending";
                        updateValuesOnSheet(payment);
                    }
                });
        });
}
// ==================== SEND FORM ====================
export async function sendForm(event) {
    console.log($w('#captcha1').token != undefined)
    if ($w('#checkbox2').checked == true && $w('#checkbox3').checked == true && $w('#checkbox4').checked == true && $w('#checkbox5').checked == true && $w('#captcha1').token != undefined) {

        wixData.query("Members").eq('email', $w('#email').value)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    saveInformation();
                } else {
                    saveMember();
                }
            })
            .catch((err) => {
                let errorMsg = err;
            });
    } else {
        $w('#checkbox2').focus();
        $w('#checkbox3').focus();
        $w('#checkbox4').focus();
        $w('#checkbox5').focus();
    }
}

async function saveMember() {
    let json = {
        'idPrivateMember': null,
        'email': $w('#email').value,
        'fullName': $w('#fullName').value
    }

    const contactInfo = {
        'email': $w('#email').value,
        'password': $w('#phone').value,
        'options': {
            'contactInfo': {
                'firstName': $w('#fullName').value
            }
        }
    }

    const { approved } = await doRegistration(contactInfo, json);
    if (approved) {
        saveInformation();
    }
}

async function saveInformation() {
    let first = $w('#Question1').value;
    if (first == "Yes") {
        $w('#text34').expand()
        await saveValuesToSheet();
        wixLocation.to('/specialthank-you');
    } else {
        $w('#statebox8').changeState("ThankYouMessage")
        await saveValuesToSheet();
    }

}

async function saveValuesToSheet() {
    let payment = "";
    if ($w('#Question1').value == "Yes") {
        $w('#text27').collapse();
        payment = "";
    } else {
        payment = "Pending";
    }
    $w('#firstField').value = payment;

    const lifeMemberOrInstructor = $w('#Question1').value;
    const memberLastYear = $w('#Question2').value;

    const indicateMembership = $w('#indicateMembership').value;
    const fullName = $w('#fullName').value;
    const phone = $w('#phone').value;
    const email = $w('#email').value;
    //const confirmEmail = $w('#confirmEmail').value;
    const fullAddress = $w('#address').value.formatted;

    const dogs1 = $w('#Dog1').value;
    const dogs2 = $w('#Dog2').value;
    const dogs3 = $w('#Dog3').value;
    const dogs4 = $w('#Dog4').value;
    const dogs5 = $w('#Dog5').value;
    const dogs6 = $w('#Dog6').value;

    const agreement1 = $w('#checkbox2').value;
    const agreement2 = $w('#checkbox3').value;
    const agreement3 = $w('#checkbox4').value;
    const agreement4 = $w('#checkbox5').value;

    await wixData.query("NSDTC30")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                rowInGoogleSheet = results.items.length + 2;
            } else {
                rowInGoogleSheet = 2;
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });

    console.log(rowInGoogleSheet)

    // GOOGLE SHEET
    const values = [payment, lifeMemberOrInstructor, memberLastYear, indicateMembership, fullName, phone, email, fullAddress,
        dogs1, dogs2, dogs3, dogs4, dogs5, dogs6, agreement1, agreement2, agreement3, agreement4
    ];
    //COLLECTION IN WIX
    let toInsert = {
        payment,
        lifeMemberOrInstructor,
        memberLastYear,
        indicateMembership,
        fullName,
        phone,
        email,
        fullAddress,
        dogs1,
        dogs2,
        dogs3,
        dogs4,
        dogs5,
        dogs6,
        agreement1,
        agreement2,
        agreement3,
        agreement4,
        rowInGoogleSheet
    };

    const res = await appendValuesWrapper(values);
    console.log(res);
    await wixData.insert('NSDTC30', toInsert)
    let date = new Date()
    await getEmail(date.toDateString())
}

// ==================== UPDATE PAYMENT ONLY WHEN THE PERSON SELECT "NO" IN THE FIRST QUESTION ====================
async function updateValuesOnSheet(payment) {
    const Payment = payment;
    const values = [Payment];
    console.log(rowInGoogleSheet);
    try {
        const res = await updateValuesWrapper(values, "A" + rowInGoogleSheet.toString(), 'ROWS');
        if ($w('#Question2').value == "Yes") {
            wixLocation.to('/thank-you-renewing-member');
        } else {
            wixLocation.to('/membership-thank-you');
        }
        console.log(res);
    } catch (err) {
        wixLocation.to('/thank-you');
        console.log(err.toString());
    }
}

export async function getEmail(date, message) {

    await wixData.query("Members").eq('email', $w('#email').value)
        .find()
        .then(async (results) => {
            if (results.items.length > 0) {
                console.log(results.items[0])
                let json = {
                    "email": results.items[0].email,
                    "fullName": results.items[0].fullName,
                    "idPrivateMember": results.items[0].idPrivateMember,
                    "date": date
                }

                if ($w('#Question1').value == 'Yes') {
                    await Email_Life_Member(json);
                } else if ($w('#Question2').value == 'Yes' && message == "Successful") {
                    await Email_Renewal(json);
                } else if ($w('#Question2').value == 'No' && message == "Successful") {
                    await Email_New_Member(json);
                }
            }
        })
        .catch((err) => {
            console.log(err)
        });
}

export function next1() { $w('#statebox8').changeState("PersonalDetails") }
export function back2() { $w('#statebox8').changeState("PreQuestions") }
export function next2() {
    $w('#textValidation').collapse();
    try {
        if ($w('#indicateMembership').value === "Family (must be resident at same address)" || $w('#indicateMembership').value === "Family (Must be living at same address)" || $w('#indicateMembership').value === "Individual") {
            checkValidation();
            $w('#statebox8').changeState("DogSName");
        } else {
            $w('#textValidation').text = 'Missing Membership';
            $w('#textValidation').expand();
        }

    } catch (err) {
        $w('#textValidation').text = err.message;
        $w('#textValidation').expand();
    }
}

function checkValidation() {
    let phone = ($w('#phone').value).split(' ');
    let phoneS = ""
    for (let i = 0; i < phone.length; i++) phoneS += phone[i]
    // console.log(phoneS)

    if (phoneS.length >= 8) {
        if (!$w('#fullName').valid) throw new Error('Missing Full Name');
        if (!$w('#phone').valid) throw new Error('Missing Mobile Phone');
        if (!$w('#email').valid) throw new Error('Missing Email');
        if (!$w('#confirmEmail').valid) throw new Error('Missing Email Confirm');
        if ($w('#email').value !== $w('#confirmEmail').value) throw new Error('Emails are not identical');
        if (!$w('#address').valid) throw new Error('Missing Address');
    } else {
        $w('#textValidation').text = "Numbers are missing on the mobile phone";
        $w('#textValidation').expand();
    }

}

export function back3() { $w('#statebox8').changeState("PersonalDetails") }
export function next3() {
    let dog1 = true,
        dog2 = true,
        dog3 = true,
        dog4 = true,
        dog5 = true,
        dog6 = true

    $w('#textValidation3').collapse();

    if ($w('#D1Name').value.length > 0 && $w('#D1Activities').value.length > 0) {
        if ($w('#D1Name').value.length > 0)
            if (!($w('#D1Activities').value.length > 0)) dog1 = false
        if ($w('#D1Activities').value.length > 0)
            if (!($w('#D1Name').value.length > 0)) dog1 = false

        if ($w('#D2Name').value.length > 0)
            if (!($w('#D2Activities').value.length > 0)) dog2 = false
        if ($w('#D2Activities').value.length > 0)
            if (!($w('#D2Name').value.length > 0)) dog2 = false

        if ($w('#D3Name').value.length > 0)
            if (!($w('#D3Activities').value.length > 0)) dog3 = false
        if ($w('#D3Activities').value.length > 0)
            if (!($w('#D3Name').value.length > 0)) dog3 = false

        if ($w('#D4Name').value.length > 0)
            if (!($w('#D4Activities').value.length > 0)) dog4 = false
        if ($w('#D4Activities').value.length > 0)
            if (!($w('#D4Name').value.length > 0)) dog4 = false

        if ($w('#D5Name').value.length > 0)
            if (!($w('#D5Activities').value.length > 0)) dog5 = false
        if ($w('#D5Activities').value.length > 0)
            if (!($w('#D5Name').value.length > 0)) dog5 = false

        if ($w('#D6Name').value.length > 0)
            if (!($w('#D6Activities').value.length > 0)) dog6 = false
        if ($w('#D6Activities').value.length > 0)
            if (!($w('#D6Name').value.length > 0)) dog6 = false

        if (dog1 && dog2 && dog3 && dog4 && dog5 && dog6) {
            $w('#statebox8').changeState("TheAgreement")
        } else {
            $w('#textValidation3').text = "Complete information";
            $w('#textValidation3').expand();
        }
    } else {
        $w('#textValidation3').text = "Complete information";
        $w('#textValidation3').expand();
    }

}

export function back4() { $w('#statebox8').changeState("DogSName") }

function error3(i) {
    $w('#textValidation3').text = "Complete information";
    $w('#textValidation3').expand();

    switch (i) {
    case 0:
        add2_click();
        break;
    case 1:
        add3_click();
        break;
    case 2:
        add4_click();
        break;
    case 3:
        add5_click();
        break;
    case 4:
        add6_click();
        break;
    }
}