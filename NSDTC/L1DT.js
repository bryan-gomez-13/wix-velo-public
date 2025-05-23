import { appendValuesWrapper } from 'backend/googlesheet-wrapper.jsw';
import { createMyPayment } from 'backend/pay';
import { doRegistration } from 'backend/signIn.jsw';
import { Email_Training_Owner, Email_Training_Sender, Email_Training_Payment } from 'backend/emails.jsw';
import wixPay from 'wix-pay';

import wixData from 'wix-data';
import wixLocation from 'wix-location';

var total = 0;

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
    $w('#bookButton').onClick(() => pay('L1DT'));
}

function getDate() {
    wixData.query("Course").eq("_id", '78fbab14-7868-46f8-8801-f7e209761bc2').find().then((results) => {
        if (results.items.length > 0) {
            let firstItem = results.items[0]; //see item below
            console.log(firstItem)
            let date = new Date(firstItem.date);
            $w('#date').text = date.toDateString();

            $w('#pricingDetails').text = 'L1DT $' + firstItem.price;
            total = firstItem.price
            $w('#totalPrice').text = '$' + firstItem.price;
            $w('#cost').text = '$' + firstItem.price;

            $w('#numberOFPeople').text = "" + firstItem.numberOfPeople;

            $w('#SubmitNoT').text = firstItem.formDisabledMessage;

            if (firstItem.enableForm == false || parseInt(firstItem.numberOfPeople) <= 0) {
                $w('#BOne').disable();
                $w('#fullName').disable();
                $w('#phone').disable();
                $w('#email').disable();
                $w('#confirmEmail').disable();
                $w('#address').disable();
                $w('#question').disable();
                $w('#SubmitNoT').expand();

                /*$w('#group5').collapse();
                $w('#confirmEmail').collapse();
                $w('#address').collapse();
                $w('#question').collapse();
                
                $w('#SubmitNoB').expand();*/
            }

        } else {
            // handle case where no matching items found
        }
    }).catch((err) => {
        let errorMsg = err;
    });
}

//	==================================================================== F I R T S	====================================================================
export async function BOne() {
    $w('#textValidation1').collapse();
    try {

        checkValidationOne();

        if ($w('#question').value == 'Yes') {
            $w('#reloadOne').expand();
            await saveValuesToSheet("");
            //await delay(2)
            //wixLocation.to('/thank-you');
            //wixLocation.to('/behaviour');
        } else {
            $w('#Box').changeState("DogSName");
        }

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

function checkValidationOneTwo() {
    if (!$w('#fullName').valid) throw new Error('Missing Full Name');
    if (!$w('#email').valid) throw new Error('Missing Email');
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
    if ($w('#check1').checked == true && $w('#check2').checked == true && $w('#check3').checked == true && $w('#check4').checked == true && $w('#check5').checked == true && $w('#captcha1').token != undefined) {
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
        $w('#textValidation4').expand();
    }
}

function BackFour() {
    $w('#Box').changeState("CheckThings");
}

// ==================================================================== P A Y ====================================================================
async function pay(course) {

    wixData.query("Course")
        .eq("course", 'L1DT')
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w('#numberOFPeople').text = "" + results.items[0].numberOfPeople;

                if (parseInt($w('#numberOFPeople').text) == 0) {
                    $w('#bookButton').disable();
                    $w('#PayNoT').expand();

                } else {

                    // Step 2 - Call backend function. 
                    // (Next, see step 3 in the backend code below.)
                    createMyPayment(course, total)
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
                                        $w('#reloadThanks').expand();

                                        // Delete one to the total
                                        await lessOne(course)

                                        payment = "Paid";
                                        await saveValuesToSheet(payment);
                                        wixLocation.to('/thank-you');
                                    } else if (result.status === "Error") {
                                        payment = "Error";
                                        await saveValuesToSheet(payment);
                                        wixLocation.to('/thank-you');
                                    }
                                });
                        });
                }

            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

//	==================================================================== G O O G L E    S H E E T ====================================================================
async function saveValuesToSheet(payment) {
    let dateT = new Date($w('#date').text);
    let date = dateT.getDate() + '/' + (dateT.getMonth() + 1) + '/' + dateT.getFullYear();

    const agressionQuestion = $w('#question').value;
    const fullName = $w('#fullName').value;
    const phone = $w('#phone').value;
    const email = $w('#email').value;
    const fullAddress = $w('#address').value.formatted;

    const dogsName = $w('#name').value;
    const dogsDob = $w('#dob').value.getDate() + '/' + (parseInt($w('#dob').value.getMonth()) + 1) + '/' + $w('#dob').value.getFullYear()
    const dogsBreed = $w('#breed').value;
    const dogsStatus = $w('#status').value;

    const indicateIfYouHave = $w('#indicate').value;
    const hearAboutUs = $w('#hear').value;
    const anythingElse = $w('#anything').value;
    const under15 = $w('#under15').value;
    const whatAge = $w('#age').value;

    const agreement1 = $w('#check1').value;
    const agreement2 = $w('#check2').value;
    const agreement3 = $w('#check3').value;
    const agreement4 = $w('#check4').value;
    const agreement5 = $w('#check5').value;

    let values = [];
    let toInsert = {};

    if ($w('#question').value == 'Yes') {

        // GOOGLE SHEET
        values = ["", agressionQuestion, date, fullName, phone, email, fullAddress, "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        //COLLECTION IN WIX
        toInsert = {
            "payment": "",
            agressionQuestion,
            date,
            fullName,
            phone,
            email,
            fullAddress,
            "dogsName": "",
            "dogsDob": "",
            "dogsBreed": "",
            "dogsStatus": "",
            "indicateIfYouHave": "",
            "hearAboutUs": "",
            "anythingElse": "",
            "under15": "",
            "whatAge": "",
            "agreement1": "",
            "agreement2": "",
            "agreement3": "",
            "agreement4": "",
            "agreement5": ""
        };

    } else {
        // GOOGLE SHEET
        values = [payment, agressionQuestion, date, fullName, phone, email, fullAddress, dogsName, dogsDob, dogsBreed,
            dogsStatus, indicateIfYouHave, hearAboutUs, anythingElse, under15, whatAge, agreement1, agreement2, agreement3, agreement4, agreement5
        ];
        //COLLECTION IN WIX
        toInsert = {
            payment,
            agressionQuestion,
            date,
            fullName,
            phone,
            email,
            fullAddress,
            dogsName,
            dogsDob,
            dogsBreed,
            dogsStatus,
            indicateIfYouHave,
            hearAboutUs,
            anythingElse,
            under15,
            whatAge,
            agreement1,
            agreement2,
            agreement3,
            agreement4,
            agreement5
        };
    }

    const res = await appendValuesWrapper(values, 'SheetL1DT');
    //console.log(res);
    await wixData.insert('Training', toInsert)
    // let date = new Date()
    await register()
}

//	==================================================================== R E G I S T E R ====================================================================
function register() {
    wixData.query("Members").eq('email', $w('#email').value)
        .find()
        .then(async (results) => {
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
                console.log(json)

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

async function lessOne(course) {
    await wixData.query("Course")
        .eq("course", course)
        .find()
        .then(async (results) => {
            if (results.items.length > 0) {
                let plan = results.items[0]; //see item below

                if (plan.numberOfPeople > 0) {
                    plan.numberOfPeople = plan.numberOfPeople - 1
                    await wixData.update("Course", plan)
                }

            } else {
                // handle case where no matching items found
            }
        })
        .catch((err) => {
            let errorMsg = err;
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