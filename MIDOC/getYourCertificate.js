let needCertificateFor;
let guestLogin, alreadyMember, toCreateMember;
let symptom, symptomValue;
let fromDate;
let tillDate;
let thnkyouPageLink = '/'
let firstName;
let lastName;
let guardianFirstName, guardianLastName;
let email;
let phoneNumber;
let dob;
let address;
let under18Flag;
let countryCode = "AUS";
let finalCertificatePriceValue;
let isLoggedIn;
let forSelfOrChild, childsFirstName, childsLastName, childDOB;
let memberID, memberFirstName, memberLastName, memberEmail, memberPhoneNumber, memberAddress, memberDOB, memberPictureID, contactID;
let loginEmailInput;
let loginPasswordInput;
let toRegister, checktoInsert;
let largerTimeOutValue = 10000;
let smallerTimeoutValue = 3000;
let imageToUpload;
var convertedUrl, convertedImageUrl;

let originalFromDate, originalTillDate;

let fromDateString, toDateString, BdayDateString, MembersDOBString, symptomStartDateString, originalBday;
let nameOfCarerPerson, symptomStartDate, symptomAdvisory;
let regMedicationDropdown, existingHealthCondn, aboriginalStatus, existingHealthTxt;
let medicalSymptomStartDateString;
let heardAboutValue;
let typeOfCertificate, paymentValue, paymentValueDefault;

let standardPaymentValue, priorityPaymentValue, standardPaymentValueDefault;

let userTimeZoneOffsetMinutes;

let contactCreated;

let numberOfDaysChosen, certType;

import wixPay from 'wix-pay';
import wixPayFrontend from 'wix-pay-frontend';
import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members';
import { makePayment } from 'backend/payment.jsw';
import wixWindow from 'wix-window';
import { getLoggedInMemberDetails, NewContactRegistration, getContactDetails, checkIfExistingMember } from 'backend/registration.jsw'
import { insertInitialPaymentData, insertInitialPaymentDataForDatabase } from 'backend/insertData.jsw';

import { changeDateToString } from 'backend/bdateChanger.jsw'

import wixLocation from 'wix-location';
import { session } from 'wix-storage';
let dbName = "MedicalCertificateTranscations";

// ...

// ...
let toInsert = {};

$w.onReady(async function () {

    loadSymptomStartDates()
    userTimeZoneOffsetMinutes = new Date().getTimezoneOffset();
    console.log(`User's time zone offset in minutes: ${userTimeZoneOffsetMinutes}`);
    // Convert the offset to hours and minutes for display
    const hours = Math.abs(Math.floor(userTimeZoneOffsetMinutes / 60));
    const minutes = Math.abs(userTimeZoneOffsetMinutes % 60);

    console.log(`User's time zone offset: ${hours}:${minutes}`);

    $w('#loginStatusTxt').text = `Checking Login Status...`;

    isLoggedIn = authentication.loggedIn();

    if (isLoggedIn) {
        console.log('Member is logged in');
        $w('#loginStatusTxt').text = `You are logged in already. Please wait...`
        console.log('Member is logged in');
        await getLoggedInMemberDetails()
            .then((memberData) => {
                console.log('memberdata', memberData);
                memberID = memberData._id;
                memberFirstName = memberData.contactDetails.firstName; //.info.name.first; ;
                memberLastName = memberData.contactDetails.lastName; // info.name.last; // contactDetails.firstName;
                memberEmail = memberData.loginEmail; // primaryInfo.email; // info.emails[0].email; // loginEmail;
                memberPhoneNumber = memberData.contactDetails.phones[0]; //  .primaryInfo.phone; // info.phones[0].phone; // .contactDetails.phones[0];
                memberAddress = memberData.contactDetails.customFields['custom.addressdetails']['value']; // .info.extendedFields['custom.addressdetails']; // .contactDetails.customFields['custom.addressdetails']['value']; 
                memberDOB = memberData.contactDetails.customFields['custom.dateofbirth']['value']; //.info.extendedFields['custom.dob']; // .contactDetails.customFields['custom.dob']['value'];
                console.log(memberFirstName, memberLastName, memberEmail, memberPhoneNumber, memberAddress, memberDOB, memberPictureID);

                toInsert.firstName = memberFirstName;
                toInsert.lastName = memberLastName;
                toInsert.email = memberEmail;
                toInsert.phone = Number(memberPhoneNumber);
                toInsert.address = memberAddress;
                toInsert.dob = memberDOB;

                console.log('toinsert', toInsert);

                $w('#multiStateBox').changeState("confirmationState");
                $w('#loginAndContinue').hide();
                $w('#loginAndContinue').collapse();

                $w('#backRegisterBtn').show();
                $w('#backRegisterBtn').expand();
                toCreateMember = false;
                guestLogin = false;
                alreadyMember = true;

            })
    } else {
        console.log('Member is not logged in');
        $w('#multiStateBox').changeState("loginOrContinue");

    }

    numberOfDaysChosen = session.getItem("daysChosen"); // "value"
    console.log(`Number of Days chosen is ${numberOfDaysChosen}`);
    certType = session.getItem("certificateTypeSessionItem")
    if (numberOfDaysChosen == "1") {
        toInsert.numberOfDaysChosen = "Single Day";
        if (certType == "Medical")
            thnkyouPageLink = "/thank-you-page-one-day-certificate"
        else if (certType == "Carer") thnkyouPageLink = "/thank-you-page-career-one-day-certif"
        $w('#tillDate').collapse(); //hidden because its only day.
        $w('#tillDate').hide();
        standardPaymentValueDefault = 18;
        standardPaymentValue = 18.61;
        $w('#payStandardBtn').label = `$${standardPaymentValueDefault}`
        priorityPaymentValue = 49;
        $w('#payPriorityBtn').label = `$${priorityPaymentValue}`

    } else if (numberOfDaysChosen == "7") {
        toInsert.numberOfDaysChosen = "Multi-day";
        if (certType == "Medical")
            thnkyouPageLink = "/thank-you-page-multi-day-certificate"
        else if (certType == "Carer") thnkyouPageLink = "/thank-you-page-career-multi-day-cert"
        console.log("till date is not collapsed");
        standardPaymentValueDefault = 36;
        standardPaymentValue = 36.91;
        $w('#payStandardBtn').label = `$${standardPaymentValueDefault}`
        priorityPaymentValue = 69;
        $w('#payPriorityBtn').label = `$${priorityPaymentValue}`

    } else if (!numberOfDaysChosen) {
        console.log("do nothing");
        wixLocation.to("/#anchor1");
    }

});

export function continueWithoutLoggingInBtn_click(event) {
    $w('#multiStateBox').changeState("confirmationState");
    guestLogin = true;
    toCreateMember = false;
    alreadyMember = false;

}

export async function agreeToLoginBtn_click(event) {
    $w('#multiStateBox').changeState("loginState");
    guestLogin = false;
    toCreateMember = false;
    alreadyMember = false;
}

//LOGIN OR CONTINUE PAGE END

//LOGIN STATE

export function loginBtn_click(event) {
    loginEmailInput = $w('#loginEmailInput').value;
    loginPasswordInput = $w('#loginPWInput').value;
    loginMsgBox("Please wait while we check your details", smallerTimeoutValue)

    if ($w('#loginEmailInput').valid && $w('#loginPWInput').valid) {
        loginExistingMember(loginEmailInput, loginPasswordInput);

    } else {
        loginMsgBox("Email/Password value is incorrect/missing. Please try again", largerTimeOutValue);
    }
}

export function backLoginBtn_click(event) {
    $w('#multiStateBox').changeState("loginOrContinue");
}

export async function loginExistingMember(email, password) {

    try {
        await authentication.login(email, password);
        console.log('Member is logged in');
        loginMsgBox("Login Successfull. Please wait while we redirect you", largerTimeOutValue);

        await getLoggedInMemberDetails()
            .then((memberData) => {
                memberID = memberData._id;
                memberFirstName = memberData.contactDetails.firstName; //.info.name.first; ;
                memberLastName = memberData.contactDetails.lastName; // info.name.last; // contactDetails.firstName;
                memberEmail = memberData.loginEmail; // primaryInfo.email; // info.emails[0].email; // loginEmail;
                memberPhoneNumber = memberData.contactDetails.phones[0]; //  .primaryInfo.phone; // info.phones[0].phone; // .contactDetails.phones[0];
                memberAddress = memberData.contactDetails.customFields['custom.addressdetails']['value']; // .info.extendedFields['custom.addressdetails']; // .contactDetails.customFields['custom.addressdetails']['value']; 
                memberDOB = memberData.contactDetails.customFields['custom.dateofbirth']['value']; //.info.extendedFields['custom.dob']; // .contactDetails.customFields['custom.dob']['value'];
                console.log(memberFirstName, memberLastName, memberEmail, memberPhoneNumber, memberAddress, memberDOB, memberPictureID);

                toInsert.firstName = memberFirstName;
                toInsert.lastName = memberLastName;
                toInsert.email = memberEmail;
                toInsert.phone = Number(memberPhoneNumber);
                toInsert.address = memberAddress;
                toInsert.dob = memberDOB;

                $w('#multiStateBox').changeState("confirmationState");
                $w('#loginAndContinue').hide();
                $w('#loginAndContinue').collapse();

                $w('#backRegisterBtn').show();
                $w('#backRegisterBtn').expand();

                toCreateMember = false;
                guestLogin = false;
                alreadyMember = true;

            })

    } catch (error) {
        console.log(`error for ${email} with code ${error.details.applicationError.code}`);

        if (error.details.applicationError.code === "-19976") {
            loginMsgBox("Password is incorrect for the email. Please try again", largerTimeOutValue);
        } else if (error.details.applicationError.code === "-19999") {
            loginMsgBox("Email is not found to be registered.", largerTimeOutValue);
        } else {
            loginMsgBox("Something went wrong. Please try again.", largerTimeOutValue);
        }
    }
}

export function loginMsgBox(msgValue, timeoutValue) {
    $w('#loginMsgBoxTxt').show();
    $w('#loginMsgBoxTxt').expand();

    $w('#loginMsgBoxTxt').text = msgValue;

    setTimeout(() => {
        $w('#loginMsgBoxTxt').hide();
        $w('#loginMsgBoxTxt').collapse();
    }, timeoutValue);

}

export function forgotPWLink_click(event) {
    $w('#multiStateBox').changeState("forgotPWState");

}

//LOGIN STATE END

//FORGOT PW STATE -- 

export function forgotPwdBtn_click(event) {

    let options = {
        hideIgnoreMessage: true
    }

    authentication.sendSetPasswordEmail($w('#forgotEmailInput').value, options)
        .then((status) => {

            console.log(status);
            if (status === true) {
                console.log('Email sent!');
                forgotPwdBox("Email sent with reset link. Please check. Redirecting to home page...", largerTimeOutValue)
                setTimeout(() => {
                    wixLocation.to("/")
                }, 4000);
            }
            return status;
        })
        .catch((error) => {
            console.error(error);
            console.log(error)
            forgotPwdBox(error.message, largerTimeOutValue)

        });
}

export function forgotPwdBox(msgValue, timeoutValue) {
    $w('#forgotPwdTxt').show();
    $w('#forgotPwdTxt').expand();

    $w('#forgotPwdTxt').text = msgValue;

    setTimeout(() => {
        $w('#forgotPwdTxt').hide();
        $w('#forgotPwdTxt').collapse();
    }, timeoutValue);

}

//FORGOT PW STATE END

//CONFIRMATION STATE ---

export function continueConfirmationBtn_click(event) {
    $w('#multiStateBox').changeState("mainDetailsState");
}

export function confirmationBackBtn_click(event) {
    //wixWindow.lightbox.close();
    wixLocation.to("/");
}

//CONFIRMATION STATE END

//MAIN DETAILS STATE ----

export function typeOfCertificateDrpDwn_change(event) {

    typeOfCertificate = $w('#typeOfCertificateDrpDwn').value;
    let opts = [];
    $w('#symptomDropdown').options = opts;

    if (typeOfCertificate === "Carer") {

        $w('#addnCarerQnBox').expand();
        opts.push({ "label": "Unwell family member", "value": "Unwell family member" }, { "label": "Unwell household member", "value": "Unwell household member" });
        $w("#symptomDropdown").options = opts;
        $w("#symptomDropdown").selectedIndex = undefined;

        if (numberOfDaysChosen === "7") {
            console.log("7 days required with to date")
            loadFromDatesFor3Months()

        } else if (numberOfDaysChosen === "1") {

            console.log("1 days required with to date")
            loadFromDatesFor3Months()

        }

    } else if (typeOfCertificate === "Medical") {

        $w('#addnCarerQnBox').collapse();

        opts.push({ "label": "Allergy (hay fever not anaphylaxis)", "value": "Allergy (hay fever not anaphylaxis)" }, { "label": "Bereavement (mental health)", "value": "Bereavement (mental health)" }, { "label": "Back Pain (existing injury) ", "value": "Back Pain (existing injury)" }, { "label": "Common Cold", "value": "Common Cold" },

            { "label": "Asthma", "value": "Asthma" }, { "label": "Covid", "value": "Covid" }, { "label": "Anxiety/Depression (diagnosed) (no self-harm thoughts)", "value": "Anxiety/Depression (diagnosed) (no self-harm thoughts)" }, { "label": "Day procedure", "value": "Day procedure" }, { "label": "Flu (i am breathing ok)", "value": "Flu (i am breathing ok)" }, { "label": "Gastro (vomiting or diarrhoea)", "value": "Gastro (vomiting or diarrhoea)" }, { "label": "Headache (previously diagnosed) (I am not dizzy or nauseous)", "value": "Headache (previously diagnosed) (I am not dizzy or nauseous)" }, { "label": "Hand foot and Mouth infection", "value": "Hand foot and Mouth infection" }, { "label": "Overtired (from work)", "value": "Overtired (from work)" }, { "label": "Period Pain (I am not pregnant)", "value": "Period Pain (I am not pregnant)" }, { "label": "Pregnancy (I am pregnant)", "value": "Pregnancy (I am pregnant)" }, { "label": "Sunburn (mild)", "value": "Sunburn (mild)" }, { "label": "Stress from work (no self-harm thoughts)", "value": "Stress from work (no self-harm thoughts)" }, { "label": "Stress from private life (no self-harm thoughts)", "value": "Stress from private life (no self-harm thoughts)" }, { "label": "Sore throat (mild)", "value": "Sore throat (mild)" }, { "label": "Upset tummy (from food)", "value": "Upset tummy (from food)" }, { "label": "Workplace bullying", "value": "Workplace bullying" }, { "label": "Other (please detail on next page)", "value": "Other (please detail on next page)" }

        );
        $w("#symptomDropdown").options = opts;
        $w("#symptomDropdown").selectedIndex = undefined;

        loadFromDatesForOnlyTodaysDate();
    }

}

export function symptomDropdown_change(event) {

    symptomValue = $w('#symptomDropdown').value;

}

export function loadSymptomStartDates() {
    let todaysDate = new Date();
    console.log(todaysDate);

    let for3Days = new Date(todaysDate.getTime() - (3 * 24 * 60 * 60 * 1000)); // 90 days from now
    console.log(for3Days);

    const enabledRange = [{
        startDate: new Date(for3Days), // for 3 days, 
        endDate: new Date(todaysDate) // todays
    }];

    $w('#symptomStartDate').enabledDateRanges = enabledRange;
    $w('#symptomStartDate').enable();
    $w('#medicalSymptomStartDate').enabledDateRanges = enabledRange;
    $w('#medicalSymptomStartDate').enable();
}

export function loadFromDatesFor3Months() {
    let todaysDate = new Date();
    console.log(todaysDate);

    let for3Months = new Date(todaysDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days from now
    console.log(for3Months);

    const enabledRange = [{
        startDate: new Date(todaysDate), // todaysDate, 
        endDate: new Date(for3Months) // for3Months
    }];
    $w('#fromDate').enabledDateRanges = enabledRange;

    $w('#fromDate').enable();
}

export function loadFromDatesForOnlyTodaysDate() {

    let todaysDate = new Date();
    console.log(todaysDate);
    let for7Days = new Date(todaysDate.getTime() + (6 * 24 * 60 * 60 * 1000)); // 7 days from now

    const enabledRange = [{
        startDate: new Date(todaysDate),
        endDate: new Date(for7Days)
    }];
    $w('#fromDate').enabledDateRanges = enabledRange;

    $w('#fromDate').enable();
}

export async function fromDate_change(event) {
    originalFromDate = $w('#fromDate').value.toDateString();
    console.log(`Original From Date is ${originalFromDate}`)

    if (numberOfDaysChosen === "1") {
        console.log("load only one day for till date");
        setTillDateToCurrentDate()
    } else if (numberOfDaysChosen === "7") {
        console.log("load only seven day for till date");
        setTillDateToLoadSevenDays();
    }

}

export async function setTillDateToCurrentDate() {
    $w('#tillDate').value = $w('#fromDate').value;
    originalTillDate = $w('#tillDate').value.toDateString();
    //$w('#continueMainDetails').enable();
}

export function setTillDateToLoadSevenDays() {
    let fromDateValue = $w('#fromDate').value;
    let tillDateValue = new Date(fromDateValue.getTime() + (6 * 24 * 60 * 60 * 1000)); // 7 days from now
    const enabledRange = [{
        startDate: new Date(fromDateValue),
        endDate: new Date(tillDateValue)
    }];
    $w('#tillDate').enabledDateRanges = enabledRange;

    $w('#tillDate').enable();

}

export async function tillDate_change(event) {
    console.log("Till Date value chosen is " + $w('#tillDate').value);
    originalTillDate = $w('#tillDate').value.toDateString();
    //    $w('#continueMainDetails').enable();

}

export async function symptomStartDate_change(event) {
    const originalSymptomStartDate = $w('#symptomStartDate').value.toDateString();
    symptomStartDateString = await changeDateToString(originalSymptomStartDate, userTimeZoneOffsetMinutes);
    console.log(`Symptom start date returned is ${symptomStartDateString}`)
}

export async function continueMainDetails_click(event) {

    if (typeOfCertificate === "Carer") {

        let stage2valid = checkValidityState2ForCarer();

        if (stage2valid) {

            fromDateString = await changeDateToString(originalFromDate, userTimeZoneOffsetMinutes);
            console.log(`Formatted FromDateString is ${fromDateString}`); // Output: "10/08/2023"

            console.log("From Date chosen is " + $w('#fromDate').value);

            toDateString = await changeDateToString(originalTillDate, userTimeZoneOffsetMinutes);
            toInsert.tillDate = toDateString;
            console.log(`ToDateString is ${toDateString}`);

            needCertificateFor = $w('#needCertificateForDrpDwn').value;
            symptom = $w('#symptomDropdown').value;
            fromDate = $w('#fromDate').value;
            tillDate = $w('#tillDate').value;
            nameOfCarerPerson = $w('#nameOfCarerPerson').value;
            symptomStartDate = $w('#symptomStartDate').value;
            symptomAdvisory = $w('#symptomAdvise').value;

            toInsert.typeOfCertificate = typeOfCertificate;
            toInsert.medicalNeedFor = needCertificateFor;
            toInsert.medicalSymptom = symptom;
            toInsert.fromDate = fromDateString;
            //toInsert.tillDate = toDateString;
            toInsert.nameofCaredPerson = nameOfCarerPerson;
            toInsert.symptomStartDate = symptomStartDateString;
            toInsert.symptomAdvise = symptomAdvisory;

            $w('#fromDate').value = new Date(fromDate);
            $w('#tillDate').value = new Date(tillDate);

            if (guestLogin) {
                $w('#multiStateBox').changeState("registerState");
            } else if (alreadyMember) {
                $w('#multiStateBox').changeState("choosePaymentState");
            }

        }

    } else if (typeOfCertificate === "Medical") {
        let stage2valid = checkValidityState2ForMedical();

        if (stage2valid) {

            fromDateString = await changeDateToString(originalFromDate, userTimeZoneOffsetMinutes);
            console.log(`Formatted FromDateString is ${fromDateString}`); // Output: "10/08/2023"

            console.log("From Date chosen is " + $w('#fromDate').value);

            toDateString = await changeDateToString(originalTillDate, userTimeZoneOffsetMinutes);
            toInsert.tillDate = toDateString;
            console.log(`ToDateString is ${toDateString}`);

            needCertificateFor = $w('#needCertificateForDrpDwn').value;
            symptom = $w('#symptomDropdown').value;
            fromDate = $w('#fromDate').value;
            tillDate = $w('#tillDate').value;

            toInsert.typeOfCertificate = typeOfCertificate;
            toInsert.medicalNeedFor = needCertificateFor;
            toInsert.medicalSymptom = symptom;
            toInsert.fromDate = fromDateString;
            // toInsert.tillDate = toDateString;

            $w('#fromDate').value = new Date(fromDate);
            $w('#tillDate').value = new Date(tillDate);

            $w('#multiStateBox').changeState("mainDetailsState2");

        }

    }
}

export function checkValidityState2ForMedical() {

    let toCheck = {
        "Certificate Option": $w('#typeOfCertificateDrpDwn').valid,
        "Medical Need For": $w('#needCertificateForDrpDwn').valid,
        "Medical Symptom": $w('#symptomDropdown').valid,
        "From Date": $w('#fromDate').valid,
        "Till Date": $w('#tillDate').valid
    }

    let errorMessage = "";
    let hasError = false;

    for (const key in toCheck) {
        if (!toCheck[key]) {
            errorMessage += `${key} is not chosen or incorrect.\n `;
            hasError = true;
        }
    }

    if (hasError) {
        console.error(errorMessage);
        console.log(errorMessage);
        let errorMsg = errorMessage;
        msgBoxState1(errorMsg, largerTimeOutValue);
        return false //shits inccorrect;

    } else {
        return true //shits good
    }

}

export function checkValidityState2ForCarer() {

    let toCheck = {
        "Certificate Option": $w('#typeOfCertificateDrpDwn').valid,
        "Medical Need For": $w('#needCertificateForDrpDwn').valid,
        "Medical Symptom": $w('#symptomDropdown').valid,
        "From Date": $w('#fromDate').valid,
        "Till Date": $w('#tillDate').valid,
        "Name of Carer Person": $w('#nameOfCarerPerson').valid,
        "Symptom Start Date": $w('#symptomStartDate').valid,
        "Symptom Advisory": $w('#symptomAdvise').valid
    }

    let errorMessage = "";
    let hasError = false;

    for (const key in toCheck) {
        if (!toCheck[key]) {
            errorMessage += `${key} is not chosen or incorrect.\n `;
            hasError = true;
        }
    }

    if (hasError) {
        console.error(errorMessage);
        console.log(errorMessage);
        let errorMsg = errorMessage;
        msgBoxState1(errorMsg, largerTimeOutValue);
        return false //shits inccorrect;

    } else {
        return true //shits good
    }

}

export function msgBoxState1(msgValue, timeoutValue) {
    $w('#msgBoxState1Txt').show();
    $w('#msgBoxState1Txt').expand();

    $w('#msgBoxState1Txt').text = msgValue;

    setTimeout(() => {
        $w('#msgBoxState1Txt').hide();
        $w('#msgBoxState1Txt').collapse();
    }, timeoutValue);

}

//MAIN DETAILS STATE END

//MAIN DETAILS 2 STATE ----

export function regMedicationDrpdwn_change(event) {
    regMedicationDropdown = $w('#regMedicationDrpdwn').value;

    if (regMedicationDropdown === "Yes") {
        $w('#regMedTxtBox').expand();

    } else if (regMedicationDropdown === "No") {
        $w('#regMedTxtBox').collapse();
    }

}

existingHealthTxt = $w("#existingHealthTxtBox").value;

// export function existingHealthCondnDropdown_change(event) {
//     existingHealthCondn = $w('#existingHealthCondnDropdown').value;

//     if (existingHealthCondn === "Yes") {
//         $w('#existingHealthTxtBox').expand();

//     } else if (existingHealthCondn === "No") {
//         $w('#existingHealthTxtBox').collapse();

//     }

// }

const maxLengthexistinghealth = 35;
const inputFieldexistinghealth = $w("#existingHealthTxtBox");
const messageexistinghealth = $w("#existingHealthTxtBoxnot");
messageexistinghealth.hide();

let textexistinghealth = inputFieldexistinghealth.value;

// Set up an event handler for when the user leaves the textarea (on blur)
inputFieldexistinghealth.onBlur(() => {
    let text = inputFieldexistinghealth.value;

    // Check if the input is less than the minimum length
    if (text.length < maxLengthexistinghealth) {
        // Show the message if input is too short
        messageexistinghealth.text = `Please enter at least ${maxLengthexistinghealth} characters.`;
        messageexistinghealth.show();
        messageexistinghealth.expand();

        // Change the textarea border to red
        inputFieldexistinghealth.style.borderColor = "red";
    } else {
        // Hide the message if input meets the minimum length
        messageexistinghealth.hide();
        messageexistinghealth.collapse();

        // Reset the textarea border color to the default
        inputFieldexistinghealth.style.borderColor = "#ccc"; // Change this to the original border color
    }
});

export function aborginalDropdown_change(event) {
    aboriginalStatus = $w('#aborginalDropdown').value;
}

export function mainDetails2NxtBtn_click(event) {

    let mainDetails2Validtity = checkValidityForMainDetails2()

    if (mainDetails2Validtity) {
        toInsert.regularMedicationOption = regMedicationDropdown
        toInsert.regularMedicationTxt = $w('#regMedTxtBox').value;
        toInsert.existingHealthCondn = existingHealthCondn;
        toInsert.existingHealthCondnTxt = $w('#existingHealthTxtBox').value;
        toInsert.aboriginalStatus = aboriginalStatus

        $w('#multiStateBox').changeState("mainDetailsState3")
    }

}

export function checkValidityForMainDetails2() {

    let toCheck;

    if ((!regMedicationDropdown) || (!aboriginalStatus)) {

        toCheck = {
            //"Existing Health Condition Dropdown": $w('#existingHealthCondnDropdown').valid,
            "List of Medications Dropdown": $w('#regMedicationDrpdwn').valid,
            "Aboriginal Status": $w('#aborginalDropdown').valid,
        }
    } else if (regMedicationDropdown === "Yes") {

        toCheck = {
            "Existing Health Condition Input": $w('#existingHealthTxtBox').valid,
            "List of Medications Input": $w('#regMedTxtBox').valid,
            "Aboriginal Status": $w('#aborginalDropdown').valid,
        }

    } else if (regMedicationDropdown === "No") {
        toCheck = {
            "Existing Health Condition Input": $w('#existingHealthTxtBox').valid,
            "Aboriginal Status": $w('#aborginalDropdown').valid,
        }
        // } else if ((existingHealthCondn === "No") && (regMedicationDropdown === "Yes")) {
        //     toCheck = {
        //         "List of Medications Input": $w('#regMedTxtBox').valid,
        //         "Aboriginal Status": $w('#aborginalDropdown').valid,
        //     }
        // } else if ((existingHealthCondn === "No") && (regMedicationDropdown === "No")) {
        //     toCheck = {
        //         "Aboriginal Status": $w('#aborginalDropdown').valid,
        //     }
    }

    let errorMessage = "";
    let hasError = false;

    for (const key in toCheck) {
        if (!toCheck[key]) {
            errorMessage += `${key} is not chosen or incorrect.\n `;
            hasError = true;
        }
    }

    if (hasError) {
        console.error(errorMessage);
        console.log(errorMessage);
        let errorMsg = errorMessage;
        msgBoxMainDetails2(errorMsg, largerTimeOutValue);
        return false //shits inccorrect;

    } else {
        return true //shits good
    }
}

export function msgBoxMainDetails2(msgValue, timeoutValue) {
    $w('#mainDetails2MsgBoxTxt').show();
    $w('#mainDetails2MsgBoxTxt').expand();

    $w('#mainDetails2MsgBoxTxt').text = msgValue;

    setTimeout(() => {
        $w('#mainDetails2MsgBoxTxt').hide();
        $w('#mainDetails2MsgBoxTxt').collapse();
    }, timeoutValue);
}

export function mainDetails2BackBtn_click(event) {
    $w('#multiStateBox').changeState("mainDetailsState")
}

//MAIN DETAILS 2 STATE END ----

//REGISTER STATE ----

export function emailInput_input(event) {
    $w('#createAccountCheckbox').expand();
}

export function createAccountCheckbox_change(event) {
    if ($w('#createAccountCheckbox').checked) {
        $w('#PWbox').expand();
        console.log("to create member flag is true")
        toCreateMember = true;
        guestLogin = false;
        alreadyMember = false;
    } else {
        $w('#PWbox').collapse();
        console.log("to create member flag is false")
        toCreateMember = false;
        guestLogin = true;
        alreadyMember = false;
    }
}

export async function dobInput_change(event) {

    console.log("Date of Birth value chosen is " + $w('#dobInput').value);
    originalBday = $w('#dobInput').value.toDateString();

    const dobDate = new Date(originalBday);
    const currentDate = new Date();

    // Calculate the difference in years between the current date and the date of birth
    let age = currentDate.getFullYear() - dobDate.getFullYear();

    // Check if the birthday has occurred this year
    if (
        currentDate.getMonth() < dobDate.getMonth() ||
        (currentDate.getMonth() === dobDate.getMonth() &&
            currentDate.getDate() < dobDate.getDate())
    ) {
        age--; // Subtract 1 year if the birthday hasn't occurred yet this year
    }

    // Check if the calculated age is less than 18
    if (age < 18) {
        console.log("User is under 18 years old");
        $w('#registerStateBox').expand();
        $w('#phoneInput').placeholder = `Guardian / Parent Phone Number`;
        under18Flag = true;
    } else {
        console.log("User is 18 years or older");
        $w('#registerStateBox').collapse();
        $w('#phoneInput').placeholder = `Your Phone Number`;
        $w('#guardianFirstNameInput').value = null;
        $w('#guardianLastNameInput').value = null;
        under18Flag = false;
    }

    //BdayDateString = await changeDateToString(originalBday, userTimeZoneOffsetMinutes);

}

export async function continueRegisterBtn_click(event) {

    $w('#continueRegisterBtn').disable();
    $w('#backRegisterBtn').disable();
    console.log(`Member to be created flag is ${toCreateMember}`);

    if (toCreateMember) {
        console.log("membership to be checked");

        let PWcheck = checkValidityWithPW()

        if (PWcheck) {
            msgBoxRegisterState("Checking email status. Please wait...", largerTimeOutValue);

            let checkMembership = await checkIfExistingMember($w('#emailInput').value);

            if (checkMembership) {
                msgBoxRegisterState("This email is already registered. Please use another email or login to continue.", largerTimeOutValue);
                $w('#loginAndContinue').expand();
                $w('#loginAndContinue').show();

                $w('#backRegisterBtn').hide();
                $w('#backRegisterBtn').collapse();

                $w('#continueRegisterBtn').enable();
                $w('#backRegisterBtn').enable();
            } else { //
                console.log("no user found");
                //BdayDateString = await changeDateToString(originalBday, userTimeZoneOffsetMinutes);
                BdayDateString = await changeDateToString(originalBday);

                toInsert.firstName = $w('#firstNameInput').value;
                toInsert.lastName = $w('#lastNameInput').value;
                toInsert.email = $w('#emailInput').value;
                toInsert.password = $w('#passwordInput').value;
                toInsert.dob = BdayDateString;
                toInsert.phone = Number($w('#phoneInput').value);
                toInsert.address = $w('#addressInput').value.formatted;
                toInsert.guardianFirstName = $w('#guardianFirstNameInput').value;
                toInsert.guardianLastName = $w('#guardianLastNameInput').value;

                toRegister = {
                    "firstName": $w('#firstNameInput').value,
                    "lastName": $w('#lastNameInput').value,
                    "email": $w('#emailInput').value,
                    "password": $w('#passwordInput').value,
                    "dob": BdayDateString, //$w('#dobInput').value, //.toISOString(),
                    "phone": $w('#phoneInput').value,
                    "address": $w('#addressInput').value.formatted
                };

                $w('#multiStateBox').changeState("choosePaymentState");
                $w('#continueRegisterBtn').enable();
                $w('#backRegisterBtn').enable();

            }

        } else {
            console.log("directly just enabling buttons");
            $w('#continueRegisterBtn').enable();
            $w('#backRegisterBtn').enable();
        }
    } else if (guestLogin) {

        console.log("contact to be created");
        let withoutPWCheck = checkValidityWithoutPW()

        if (withoutPWCheck) {
            //let dateOfBirth = BdayDateString; // new Date($w('#dobInput').value).toLocaleDateString('en-GB');
            //BdayDateString = await changeDateToString(originalBday, userTimeZoneOffsetMinutes);
            BdayDateString = await changeDateToString(originalBday);

            toInsert.firstName = $w('#firstNameInput').value;
            toInsert.lastName = $w('#lastNameInput').value;
            toInsert.email = $w('#emailInput').value;
            toInsert.password = $w('#passwordInput').value;
            toInsert.dob = BdayDateString;
            toInsert.phone = Number($w('#phoneInput').value);
            toInsert.address = $w('#addressInput').value.formatted;
            toInsert.guardianFirstName = $w('#guardianFirstNameInput').value;
            toInsert.guardianLastName = $w('#guardianLastNameInput').value;

            toRegister = {
                "firstName": $w('#firstNameInput').value,
                "lastName": $w('#lastNameInput').value,
                "email": $w('#emailInput').value,
                "password": $w('#passwordInput').value,
                "dob": BdayDateString, // $w('#dobInput').value, //.toISOString(),
                "phone": $w('#phoneInput').value,
                "address": $w('#addressInput').value.formatted
            };

            $w('#multiStateBox').changeState("choosePaymentState");
        } else {
            $w('#continueRegisterBtn').enable();
            $w('#backRegisterBtn').enable();
        }

    }

}

export function msgBoxRegisterState(msgValue, timeoutValue) {
    $w('#registerMsgBox').show();
    $w('#registerMsgBox').expand();
    $w('#msgBoxRegisterStateTxt').show();
    $w('#msgBoxRegisterStateTxt').expand();

    $w('#msgBoxRegisterStateTxt').text = msgValue;

    setTimeout(() => {
        $w('#msgBoxRegisterStateTxt').hide();
        $w('#msgBoxRegisterStateTxt').collapse();

        $w('#registerMsgBox').collapse();
        $w('#registerMsgBox').hide();
    }, timeoutValue);

}

export function checkValidityWithPW() {

    let toCheck;

    console.log(`Under18Flag is ${under18Flag}`);

    if (under18Flag) {
        toCheck = {
            "First Name": $w('#firstNameInput').valid,
            "Last Name": $w('#lastNameInput').valid,
            "Email": $w('#emailInput').valid,
            "Password": $w('#passwordInput').valid,
            "Date of Birth": $w('#dobInput').valid,
            "Phone Number": $w('#phoneInput').valid,
            "Address": $w('#addressInput').valid,
            "Guardian First Name": $w('#guardianFirstNameInput').valid,
            "Guardian Last Name": $w('#guardianLastNameInput').valid
        }
    } else {
        toCheck = {
            "First Name": $w('#firstNameInput').valid,
            "Last Name": $w('#lastNameInput').valid,
            "Email": $w('#emailInput').valid,
            "Password": $w('#passwordInput').valid,
            "Date of Birth": $w('#dobInput').valid,
            "Phone Number": $w('#phoneInput').valid,
            "Address": $w('#addressInput').valid
        }
    }

    let errorMessage = "";
    let hasError = false;

    for (const key in toCheck) {
        if (!toCheck[key]) {
            errorMessage += `${key} is not valid.\n `;
            hasError = true;
        }
    }

    if (hasError) {
        console.error(errorMessage);
        console.log(errorMessage);
        let errorMsg = errorMessage;
        msgBoxRegisterState(errorMsg, largerTimeOutValue);
        return false //shits inccorrect;

    } else {
        return true //shits good
    }

}

export function checkValidityWithoutPW() {

    let toCheck;
    console.log(`Under18Flag is ${under18Flag}`);

    if (under18Flag) {
        toCheck = {
            "First Name": $w('#firstNameInput').valid,
            "Last Name": $w('#lastNameInput').valid,
            "Email": $w('#emailInput').valid,
            "Date of Birth": $w('#dobInput').valid,
            "Phone Number": $w('#phoneInput').valid,
            "Address": $w('#addressInput').valid,
            "Guardian First Name": $w('#guardianFirstNameInput').valid,
            "Guardian Last Name": $w('#guardianLastNameInput').valid
        }
    } else {
        toCheck = {
            "First Name": $w('#firstNameInput').valid,
            "Last Name": $w('#lastNameInput').valid,
            "Email": $w('#emailInput').valid,
            "Date of Birth": $w('#dobInput').valid,
            "Phone Number": $w('#phoneInput').valid,
            "Address": $w('#addressInput').valid
        }
    }

    let errorMessage = "";
    let hasError = false;

    for (const key in toCheck) {
        if (!toCheck[key]) {
            errorMessage += `${key} is not valid.\n `;
            hasError = true;
        }
    }

    if (hasError) {
        console.error(errorMessage);
        console.log(errorMessage);
        let errorMsg = errorMessage;
        msgBoxRegisterState(errorMsg, largerTimeOutValue);
        return false //shits inccorrect;

    } else {
        return true //shits good
    }

}

export function loginAndContinue_click(event) {
    $w('#multiStateBox').changeState("loginOrContinue");
}

export function backMainDetailsState_click(event) {
    $w('#multiStateBox').changeState("confirmationState");

}

export function backRegisterBtn_click(event) {
    $w('#multiStateBox').changeState("mainDetailsState");
}

//REGISTER STATE END

//SUBMIT & PAY STATE ---- 

export async function payBtn_click(event) {

    console.log(toInsert);
    paymentMsgBox("Connecting you to Stripe. A standard transaction fee may apply....", smallerTimeoutValue);
    console.log(`Member flag is ${toCreateMember}, Guest Flag is ${guestLogin}, AlreadyMember Flag is ${alreadyMember}`);

    toInsert.heardAboutUs = heardAboutValue;
    toInsert.referralCode = $w('#referralName').value;

    toInsert.createMemberFlag = toCreateMember;
    toInsert.createContactFlag = guestLogin;
    toInsert.alreadyMemberFlag = alreadyMember;

    firstName = toInsert.firstName;
    lastName = toInsert.lastName;
    email = toInsert.email;
    phoneNumber = toInsert.phone;

    makeFinalPayment(paymentValue, firstName, lastName, email, phoneNumber, countryCode)

}

/*
export function makeFinalPayment(paymentValue, firstName, lastName, email, phoneNumber, countryCode) {
    makePayment(paymentValue, { firstName, lastName, email, phoneNumber, countryCode })
        .then((payment) => {
            console.log(`Payment ID is ${payment.id} for ${email}`);

            toInsert.paymentID = payment.id;

            //insertInitialPaymentData(toInsert)
            insertInitialPaymentDataForDatabase(toInsert, dbName)

            wixPay.startPayment(payment.id)
                .then((result) => {
                    console.log(`payment result returned`)
                    console.log(result);
                    if (result.status === "Successful") {
                        paymentMsgBox("Thanks for your payment. \n Please wait ....", largerTimeOutValue);
                        console.log("payment successful");

                        setTimeout(() => {
                            changeFinalState()
                        }, smallerTimeoutValue);

                    } else if (result.status === "Failed") {

                        $w('#cancelPayBtn').enable();
                        paymentMsgBox("Oops. Your payment failed. Please try again?", largerTimeOutValue);
                        console.log("payment failed");

                    } else if (result.status === "Pending") {

                        console.log("payment pending");
                        $w('#cancelPayBtn').enable();
                        paymentMsgBox("Oops. Your payment is left pending. Please try again?", largerTimeOutValue);

                    } else if (result.status === "Cancelled") {

                        $w('#cancelPayBtn').enable();
                        paymentMsgBox("Oops. Your payment was cancelled. Please try again?", largerTimeOutValue);
                        console.log("payment cancelled");

                    } else if (result.status === "Undefined") {
                        $w('#cancelPayBtn').enable();
                        paymentMsgBox("Oops. Your payment was undefined. Please try again?", largerTimeOutValue);
                        console.log("payment undefined ");

                    } else if (result.status === "Chargeback") {

                        $w('#cancelPayBtn').enable();
                        paymentMsgBox("Oops. Your payment was chargedback. Please try again?", largerTimeOutValue);
                        console.log("payment chargeback");

                    } else if (result.status === "Refunded") {

                        $w('#cancelPayBtn').enable();
                        paymentMsgBox("Oops. Your payment was refunded. Please try again?", largerTimeOutValue);
                        console.log("payment refuned");

                    } else if (result.status === "Offline") {

                        $w('#cancelPayBtn').enable();
                        paymentMsgBox("Oops. Your payment was offline. Please try again?", largerTimeOutValue);
                        console.log("payment cancelled");

                    } else {
                        console.log(`VERY IMPORTANT. This is a payment status that has not occured FOR ${firstName} ${lastName} ${email}}.`);
                    }
                })

        });
}
*/

export async function makeFinalPayment(paymentValue, firstName, lastName, email, phoneNumber, countryCode) {
    try {
        console.log('Yourweb', paymentValue, email)
        const paymentValueToBack = (email == 'yourweb.team22@gmail.com' || email == 'info@midoc.com.au') ? 0.5 : paymentValue;
        const payment = await makePayment(paymentValueToBack, { firstName, lastName, email, phoneNumber, countryCode });
        console.log(`Payment ID is ${payment.id} for ${email}`);

        toInsert.paymentID = payment.id;

        // Use await for the asynchronous operation
        await insertInitialPaymentDataForDatabase(toInsert, dbName);

        const result = await wixPay.startPayment(payment.id);

        console.log("Payment result returned", result);
        console.log(thnkyouPageLink);
        switch (result.status) {
        case "Successful":
            paymentMsgBox("Thanks for your payment. \n Please wait ....", largerTimeOutValue);
            wixLocation.to(thnkyouPageLink)
            console.log("Payment successful");
            break;
        case "Failed":
            $w('#cancelPayBtn').enable();
            paymentMsgBox("Oops. Your payment failed. Please try again?", largerTimeOutValue);
            console.log("Payment failed");
            break;
        case "Pending":
            console.log("Payment pending");
            $w('#cancelPayBtn').enable();
            paymentMsgBox("Oops. Your payment is left pending. Please try again?", largerTimeOutValue);
            break;
        case "Cancelled":
            $w('#cancelPayBtn').enable();
            paymentMsgBox("Oops. Your payment was cancelled. Please try again?", largerTimeOutValue);
            console.log("Payment cancelled");
            break;
        case "Undefined":
            $w('#cancelPayBtn').enable();
            paymentMsgBox("Oops. Your payment was undefined. Please try again?", largerTimeOutValue);
            console.log("Payment undefined");
            break;
        case "Chargeback":
            $w('#cancelPayBtn').enable();
            paymentMsgBox("Oops. Your payment was charged back. Please try again?", largerTimeOutValue);
            console.log("Payment chargeback");
            break;
        case "Refunded":
            $w('#cancelPayBtn').enable();
            paymentMsgBox("Oops. Your payment was refunded. Please try again?", largerTimeOutValue);
            console.log("Payment refunded");
            break;
        case "Offline":
            $w('#cancelPayBtn').enable();
            paymentMsgBox("Oops. Your payment was offline. Please try again?", largerTimeOutValue);
            console.log("Payment offline");
            break;
        default:
            console.log(`VERY IMPORTANT. This is a payment status that has not occurred FOR ${firstName} ${lastName} ${email}.`);
        }
    } catch (error) {
        console.error("Error in makeFinalPayment:", error);
    }
}

export function changeFinalState() {
    $w('#multiStateBox').changeState("state4");
}

export function paymentMsgBox(msgValue, timeoutValue) {
    $w('#paymentMsgBoxTxt').show();
    $w('#paymentMsgBoxTxt').expand();

    $w('#paymentMsgBoxTxt').text = msgValue;

    setTimeout(() => {
        $w('#paymentMsgBoxTxt').hide();
        $w('#paymentMsgBoxTxt').collapse();
    }, timeoutValue);

}

export function cancelPayBtn_click(event) {
    $w('#multiStateBox').changeState("mainDetailsState");
    $w('#continueRegisterBtn').enable();
    $w('#backRegisterBtn').enable();
}

//SUBMIT & PAY STATE END

export function oneDayMedicalBtn_click(event) {
    session.setItem("certificatePriceValue", 18.61);
    session.setItem("daysChosen", 1);
    //wixLocation.to("/onlinemedicalcertificate");
}

export function multidayMedicalBtn_click(event) {
    session.setItem("certificatePriceValue", 36.91);
    session.setItem("daysChosen", 7);
    //wixLocation.to("/onlinemedicalcertificate");

}

export function oneDayCarerBtn_click(event) {
    session.setItem("certificatePriceValue", 18.61);
    session.setItem("daysChosen", 1);
    //wixLocation.to("/onlinemedicalcertificate");
}

export function multidayCarerBtn_click(event) {
    session.setItem("certificatePriceValue", 36.91);
    session.setItem("daysChosen", 7);
    //wixLocation.to("/onlinemedicalcertificate");

}

//MAIN DETAILS 3 START
export async function medicalSymptomStartDate_change(event) {
    const originalMedicalSymptomStartDate = $w('#medicalSymptomStartDate').value;
    console.log(`Original From Date is ${originalMedicalSymptomStartDate}`)

    symptomStartDateString = await changeDateToString(originalMedicalSymptomStartDate, userTimeZoneOffsetMinutes);
    console.log(`Formatted Medical Symptom Start Date is ${symptomStartDateString}`); // Output: "10/08/2023"
}

export function doYouHaveMainDetails3Dropdown_change(event) {
    let doYouHave = $w('#doYouHaveMainDetails3Dropdown').value;

    if (doYouHave === "Yes") {
        $w('#msgBoxMainDetails3').expand();
        $w('#mainDetails3NxtBtn').disable();
    } else if (doYouHave === "No") {
        $w('#msgBoxMainDetails3').collapse();
        $w('#mainDetails3NxtBtn').enable();
    }
}

export function mainDetails3BackBtn_click(event) {
    $w('#multiStateBox').changeState("mainDetailsState2");
}

export function mainDetails3NxtBtn_click(event) {

    toInsert.symptomStartDate = symptomStartDateString

    if (guestLogin) {
        $w('#multiStateBox').changeState("registerState");
    } else {
        $w('#multiStateBox').changeState("choosePaymentState");
    }

}
//----- MAIN DETAILS 3 END

export function payStandardBtn_click(event) {
    paymentValue = standardPaymentValue
    paymentValueDefault = standardPaymentValueDefault;
    $w('#multiStateBox').changeState("submitPayState");
    toInsert.paymentValue = Number(paymentValue);
    loadFinalDetails(toInsert);
}

export function payPriorityBtn_click(event) {
    paymentValue = priorityPaymentValue;
    paymentValueDefault = standardPaymentValueDefault;
    $w('#multiStateBox').changeState("submitPayState");
    toInsert.priorityStatus = true;
    toInsert.paymentValue = Number(paymentValue);
    loadFinalDetails(toInsert);
}

export function loadFinalDetails(toInsert) {
    console.log(toInsert);
    $w('#payBtn').label = `Pay $${paymentValueDefault.toString()}`;

    if (typeOfCertificate === "Carer") {
        $w('#firstNameFinal').text = `First Name: ${toInsert.firstName}`;
        $w('#lastNameFinal').text = `Last Name: ${toInsert.lastName}`;
        $w('#emailFinal').text = `Email: ${toInsert.email}`;
        $w('#phoneFinal').text = `Phone: ${toInsert.phone}`;
        $w('#dobFinal').text = `Date of Birth: ${toInsert.dob}`;
        $w('#addressFinal').text = `Address: ${toInsert.address}`;

        $w('#needCertificateForFinal').text = `Need Certificate For: ${toInsert.medicalNeedFor}`;
        $w('#symptomFinal').text = `Symptom: ${toInsert.medicalSymptom}`
        $w('#fromDateFinal').text = `From Date: ${toInsert.fromDate}`;

        if (numberOfDaysChosen === "1") {
            $w('#tillDateFinal').collapse();
        } else if (numberOfDaysChosen === "7") {
            $w('#tillDateFinal').text = `Till Date: ${toInsert.tillDate}`;
        }

        if (under18Flag) {
            $w('#guardianFirstNameFinalTxt').text = `Guardian First Name: ${toInsert.guardianFirstName}`;
            $w('#guardianLastNameFinalTxt').text = `Guardian Last Name: ${toInsert.guardianLastName}`;

        } else {
            $w('#guardianFirstNameFinalTxt').collapse();
            $w('#guardianLastNameFinalTxt').collapse();
        }

        $w('#uniqueFinalTxt4').collapse();
        $w('#uniqueFinalTxt1').text = `Name of Person Cared For: ${toInsert.nameofCaredPerson}`;
        $w('#uniqueFinalTxt2').text = `Symptom Start Date: ${toInsert.symptomStartDate}`;
        $w('#uniqueFinalTxt3').text = `Symptom Advise: ${toInsert.symptomAdvise}`;

    } else if (typeOfCertificate === "Medical") {
        $w('#firstNameFinal').text = `First Name: ${toInsert.firstName}`;
        $w('#lastNameFinal').text = `Last Name: ${toInsert.lastName}`;
        $w('#emailFinal').text = `Email: ${toInsert.email}`;
        $w('#phoneFinal').text = `Phone: ${toInsert.phone}`;
        $w('#dobFinal').text = `Date of Birth: ${toInsert.dob}`;
        $w('#addressFinal').text = `Address: ${toInsert.address}`;

        $w('#needCertificateForFinal').text = `Need Certificate For: ${toInsert.medicalNeedFor}`;
        $w('#symptomFinal').text = `Symptom: ${toInsert.medicalSymptom}`
        $w('#fromDateFinal').text = `From Date: ${toInsert.fromDate}`;

        if (numberOfDaysChosen === "1") {
            $w('#tillDateFinal').collapse();
        } else if (numberOfDaysChosen === "7") {
            $w('#tillDateFinal').text = `Till Date: ${toInsert.tillDate}`;
        }

        if (under18Flag) {
            $w('#guardianFirstNameFinalTxt').text = `Guardian First Name: ${toInsert.guardianFirstName}`;
            $w('#guardianLastNameFinalTxt').text = `Guardian Last Name: ${toInsert.guardianLastName}`;

        } else {
            $w('#guardianFirstNameFinalTxt').collapse();
            $w('#guardianLastNameFinalTxt').collapse();
        }

        $w('#uniqueFinalTxt4').text = `Symptom Start Date: ${toInsert.symptomStartDate}`;
        $w('#uniqueFinalTxt1').text = `Health History: ${toInsert.regularMedicationOption}`;
        $w('#uniqueFinalTxt2').text = `My Symptoms: ${toInsert.existingHealthCondnTxt}`;
        $w('#uniqueFinalTxt3').text = `Gender: ${toInsert.aboriginalStatus}`;
    }

}

export function heardAboutUsDropdown_change(event) {
    $w('#payBtn').enable();
    heardAboutValue = $w('#heardAboutUsDropdown').value;

    if (heardAboutValue === "referral") {
        $w('#referralName').expand();
    } else {
        $w('#referralName').collapse();
    }

}