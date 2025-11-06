import { appendValuesWrapper } from 'backend/googlesheet-wrapper.jsw';
import { createMyPayment } from 'backend/pay';
import { doRegistration } from 'backend/signIn.jsw';
import { Email_Training_Owner, Email_Training_Sender, Email_Training_Payment } from 'backend/emails.jsw';
import { generalQuery, saveData, updateCollection, lessOne } from 'backend/collections.web.js';
import wixPay from 'wix-pay';

import wixData from 'wix-data';
import wixLocation from 'wix-location';

var total = 0,
    courseInfo;

var courseId = '78fbab14-7868-46f8-8801-f7e209761bc2';
var collectionId = 'Training';
let googleSheet = 'SheetL1DTNew';

$w.onReady(function () {
    init();
});

export function init() {
    getDate();
    $w('#BOne').onClick(() => BOne());
    $w('#BTwo').onClick(() => BTwo());
    $w('#BThree').onClick(() => BThree());
    $w('#BFour').onClick(() => BFour());
    $w('#SubmitNoB').onClick(() => fullPeople());

    $w('#back2').onClick(() => BackTwo());
    $w('#back3').onClick(() => BackThree());
    $w('#back4').onClick(() => BackFour());

    $w('#under15').onChange(() => underOption());
    $w('#indicate1').onChange(() => $w('#indicate').value = ($w('#indicate1').value).toString());
    $w('#bookButton').onClick(() => pay());
}

async function getDate() {
    const course = await generalQuery('Course', '_id', courseId);
    let firstItem = course[0]; //see item below

    console.log(firstItem)

    let date = new Date(firstItem.date);
    $w('#date').text = date.toDateString();

    $w('#pricingDetails').text = 'L1DT $' + firstItem.price;
    total = firstItem.price
    $w('#totalPrice').text = '$' + firstItem.price;
    $w('#cost').text = '$' + firstItem.price;

    $w('#remainingSpots').text = "" + firstItem.remainingSpots;

    if (firstItem.enableForm == false || parseInt(firstItem.remainingSpots) <= 0) {
        $w('#BOne').disable();
        $w('#fullName').disable();
        $w('#phone').disable();
        $w('#email').disable();
        $w('#confirmEmail').disable();
        $w('#address').disable();
        $w('#question').disable();

        $w('#Box').hide();

        if (firstItem.fullyBookedMessageActive && firstItem.fullyBookedMessage) $w('#SubmitNoT').text = firstItem.fullyBookedMessage;
        else $w('#SubmitNoT').text = firstItem.formDisabledMessage;

        $w('#SubmitNoT').expand();
    }
}

//	==================================================================== F I R T S	====================================================================
export async function BOne() {
    $w('#textValidation1').collapse();
    try {

        checkValidationOne();
        $w('#Box').changeState("DogSName");

    } catch (err) {
        $w('#textValidation1').text = err.message;
        $w('#textValidation1').expand();
    }
}

function checkValidationOne() {
    let phone = ($w('#phone').value).split(' ');
    let phoneS = "";
    for (let i = 0; i < phone.length; i++) phoneS += phone[i];

    if (!$w('#fullName').valid) throw new Error('Missing Full Name');
    if (!(phoneS.length >= 8)) throw new Error('Numbers are missing on the mobile phone');
    if (!$w('#phone').valid) throw new Error('Missing Mobile Phone');
    if (!$w('#email').valid) throw new Error('Missing Email');
    if (!$w('#confirmEmail').valid) throw new Error('Missing Email Confirm');
    if ($w('#email').value !== $w('#confirmEmail').value) throw new Error('Emails are not identical');
    if (!$w('#address').valid) throw new Error('Missing Address');
    if (!$w('#question').valid) throw new Error('Missing Question about the aggression');

}

//	==================================================================== S E C O N D	====================================================================
export function BTwo() {
    $w('#textValidation2').collapse();
    try {
        checkValidationTwo();
        $w('#Box').changeState("CheckThings");
    } catch (err) {
        $w('#textValidation2').text = err.message;
        $w('#textValidation2').expand();
    }
}

function checkValidationTwo() {

    if (!$w('#name').valid) throw new Error('Missing Dogs Name');
    if (!$w('#dob').valid) throw new Error('Missing Dogs Dob');
    if (!$w('#breed').valid) throw new Error('Missing Dogs Breed');
    if (!$w('#status').valid) throw new Error('Missing Dogs Status');

}

function BackTwo() {
    $w('#Box').changeState("PersonalDetails");
}

//	==================================================================== T H R E E	====================================================================
export function BThree() {
    $w('#textValidation3').collapse();
    try {
        checkValidationThree();
        $w('#Box').changeState("TheAgreement");
    } catch (err) {
        $w('#textValidation3').text = err.message;
        $w('#textValidation3').expand();
    }
}

function checkValidationThree() {

    if (!$w('#hear').valid) throw new Error('Missing Hear about us');
    if (!$w('#under15').valid) throw new Error('Missing Under 15');
    if ($w('#under15').value == 'Yes')
        if (!$w('#age').valid) throw new Error('Missing What age');

}

function underOption() {
    if ($w('#under15').value == 'Yes') $w('#age').expand();
    else $w('#age').collapse();
}

function BackThree() {
    $w('#Box').changeState("DogSName");
}

//	==================================================================== F O U R ====================================================================
export async function BFour() {
    $w('#textValidation4').collapse();
    //console.log($w('#captcha1').token != undefined)
    if ($w('#check1').checked == true && $w('#check2').checked == true && $w('#check3').checked == true && $w('#check4').checked == true && $w('#check5').checked == true && $w('#check6').checked == true && $w('#captcha1').token != undefined) {
        $w('#BFour').disable();
        $w('#reloadTwo').expand();
        //await delay(2)
        $w('#Box').changeState("ThankYouMessage");

    } else {
        $w('#BFour').enable();
        $w('#check1').focus();
        $w('#check2').focus();
        $w('#check3').focus();
        $w('#check4').focus();
        $w('#check5').focus();
        $w('#check6').focus();
        $w('#textValidation4').expand();
    }
}

function BackFour() {
    $w('#Box').changeState("CheckThings");
}

// ==================================================================== P A Y ====================================================================
async function pay() {
    try {
        // Get course info
        const courseInfo = (await generalQuery('Course', '_id', courseId))[0];

        // Update remaining spots
        $w('#remainingSpots').text = `${courseInfo.remainingSpots}`;

        // If no spots available, disable button and show message
        if (courseInfo.remainingSpots <= 0) {
            $w('#bookButton').disable();
            $w('#PayNoT').expand();
            return;
        }

        // Format dates
        const formatDate = (dateObj) => {
            return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
        };

        const date = formatDate(new Date($w('#date').text));
        const dogsDob = formatDate($w('#dob').value);

        // Collect form values
        const formData = {
            agressionQuestion: 'Confirm',
            date,
            fullName: $w('#fullName').value,
            phone: $w('#phone').value,
            email: $w('#email').value,
            fullAddress: $w('#address').value.formatted,
            dogsName: $w('#name').value,
            dogsDob,
            dogsBreed: $w('#breed').value,
            dogsStatus: $w('#status').value,
            indicateIfYouHave: $w('#indicate').value,
            hearAboutUs: $w('#hear').value,
            anythingElse: $w('#anything').value,
            under15: $w('#under15').value,
            whatAge: $w('#age').value,
            agreement1: 'Yes',
            agreement2: 'Yes',
            agreement3: 'Yes',
            agreement4: 'Yes',
            agreement5: 'Yes',
            agreement6: 'Yes'
        };

        // Save submission to database
        // console.log('formData', formData)
        let trainingSubmission = await saveData(collectionId, formData);

        // Reduce available spots
        const status = await lessOne(courseId, collectionId, 'payment');
        if (!status) {
            $w('#bookButton').disable();
            $w('#PayNoT').expand();
            return;
        }

        // Create payment session
        const paymentSession = await createMyPayment(courseInfo.course, total);

        // Start Wix payment process
        const result = await wixPay.startPayment(paymentSession.id, { showThankYouPage: false });
        let paymentStatus = "Pending";

        if (result.status === "Successful") {
            paymentStatus = "Paid";
            $w('#bookButton').collapse();
            $w('#text35').expand();
            $w('#reloadThanks').expand();
        } else if (result.status === "Error") {
            paymentStatus = "Error";
        }

        // Update submission with payment status
        trainingSubmission.payment = paymentStatus;

        // Save info to Google Sheet
        const sheetValues = [
            paymentStatus,
            formData.agressionQuestion,
            formData.date,
            formData.fullName,
            formData.phone,
            formData.email,
            formData.fullAddress,
            formData.dogsName,
            formData.dogsDob,
            formData.dogsBreed,
            formData.dogsStatus,
            formData.indicateIfYouHave,
            formData.hearAboutUs,
            formData.anythingElse,
            formData.under15,
            formData.whatAge,
            formData.agreement1,
            formData.agreement2,
            formData.agreement3,
            formData.agreement4,
            formData.agreement5,
            formData.agreement6
        ];

        await Promise.all([
            appendValuesWrapper(sheetValues, googleSheet),
            updateCollection(collectionId, trainingSubmission),
            register()
        ]);

        wixLocation.to('/thank-you');

    } catch (error) {
        console.error("❌ Error in pay():", error);
        // Optional: show an error message to the user
    }
}

//	==================================================================== R E G I S T E R ====================================================================
function register() {
    wixData.query("Members").eq('email', $w('#email').value).find().then(async (results) => {
        if (results.items.length > 0) {
            results.items[0].fullName = $w('#fullName').value
            await wixData.update("Members", results.items[0])
            await getEmail();
        } else {
            saveMember();
        }
    })
        .catch((err) => {
            let errorMsg = err;
        });
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
        getEmail();
    }
}

//	==================================================================== E M A I L ====================================================================
export async function getEmail() {
    let dateT = new Date($w('#date').text);
    let date = dateT.getDate() + '/' + (dateT.getMonth() + 1) + '/' + dateT.getFullYear();
    await wixData.query("Members").eq('email', $w('#email').value)
        .find()
        .then(async (results) => {
            if (results.items.length > 0) {
                //console.log(results.items[0])
                let json = {
                    "idPrivateMember": results.items[0].idPrivateMember,
                    "date": date,
                    "FullName": $w('#fullName').value,
                    "Mobile": $w('#phone').value,
                    "Email": results.items[0].email,
                    "EmailConfirm": $w('#confirmEmail').value,
                    "Address": $w('#address').value.formatted,
                    "Aggression": $w('#question').value,
                    "DogName": $w('#name').value,
                    "DogDate": $w('#dob').value.toDateString(),
                    "DogBreed": $w('#breed').value,
                    "Genero": $w('#status').value,
                    "Indicate": $w('#indicate').value,
                    "Hear": $w('#hear').value,
                    "Anything": $w('#anything').value,
                    "Under15": $w('#under15').value,
                    "Age": $w('#age').value,
                }
                // console.log(json)

                if ($w('#question').value == 'Yes') {
                    await Email_Training_Sender(json.idPrivateMember);
                    //wixLocation.to('/thank-you');
                    wixLocation.to('/behaviour');
                } else {
                    await Email_Training_Payment(json);
                    //await Email_Training_Owner(json);
                    wixLocation.to('/thank-you');
                }
            }
        })
        .catch((err) => {
            console.log(err)
        });
}

//	==================================================================== O T H E R S ====================================================================
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time * 1000);
    });
}

async function fullPeople() {

    $w('#textValidation1').collapse();
    try {
        checkValidationOne();
        let dateT = new Date($w('#date').text);
        let dateC = dateT.getDate() + '/' + (dateT.getMonth() + 1) + '/' + dateT.getFullYear();

        if ($w('#question').value == "Yes") {
            wixLocation.to('/behaviour');
        } else {
            const date = dateC;
            const course = "L1DT"
            const fullName = $w('#fullName').value;
            const email = $w('#email').value;

            let toInsert = {
                date,
                course,
                fullName,
                email
            }
            await wixData.insert('Interestedpeople', toInsert)
            wixLocation.to("/thanks")
        }
    } catch (err) {
        $w('#textValidation1').text = err.message;
        $w('#textValidation1').expand();
    }
}