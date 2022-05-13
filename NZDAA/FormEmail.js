import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { eMail } from 'backend/email'

$w.onReady(function () {
    services();
    date();
    init();
});
// ===================================================== INIT =====================================================
function init() {
    //Buttons
    $w('#next1').onClick(() => B1Next() /*$w('#statebox8').changeState("2")*/);
    $w('#next2').onClick(() => B2Next() /*$w('#statebox8').changeState("3")*/);
    $w('#next3').onClick(() => B3Next() /*$w('#statebox8').changeState("4")*/);
    $w('#back1').onClick(() => $w('#statebox8').changeState("1"))
    $w('#back2').onClick(() => $w('#statebox8').changeState("2"))
    $w('#back3').onClick(() => $w('#statebox8').changeState("3"))
    $w('#sendForm').onClick(() => sendForm())

    //Yes/No -- 2
    $w('#haveYouEverOperated').onChange(() => {
        if ($w('#haveYouEverOperated').value == 'Yes') $w('#tradingName').expand();
        else $w('#tradingName').collapse();
    });
    $w('#accreditedYesNo').onChange(() => {
        if ($w('#accreditedYesNo').value == 'Yes') $w('#accreditedIfYes').expand();
        else $w('#accreditedIfYes').collapse();
    });
    $w('#license').onChange(() => {
        if ($w('#license').value == 'Yes') $w('#licenseRA').expand();
        else $w('#licenseRA').collapse();
    });

    //Yes/No -- 3
    $w('#documentedHealthYesNo').onChange(() => {
        if ($w('#documentedHealthYesNo').value == 'No') $w('#documentedHealth').expand();
        else $w('#documentedHealth').collapse();
    });
    $w('#noticesYesNo').onChange(() => {
        if ($w('#noticesYesNo').value == 'Yes') $w('#notices').expand();
        else $w('#notices').collapse();
    });
    $w('#environmentalAbatementYesNo').onChange(() => {
        if ($w('#environmentalAbatementYesNo').value == 'Yes') $w('#environmentalAbatement').expand();
        else $w('#environmentalAbatement').collapse();
    });
    $w('#commendationsYesNo').onChange(() => {
        if ($w('#commendationsYesNo').value == 'Yes') $w('#commendations').expand();
        else $w('#commendations').collapse();
    });
    $w('#associationsYesNo').onChange(() => {
        if ($w('#associationsYesNo').value == 'Yes') $w('#associations').expand();
        else $w('#associations').collapse();
    });

    //services
    $w('#services').onChange(() => servicesOther())
}
// ===================================================== SERVICES =====================================================
function services() {
    wixData.query("Services")
        .ascending('title')
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                //console.log(results.items)
                let services = []
                for (let i = 0; i < results.items.length; i++) {
                    services.push({ label: results.items[i].title, value: results.items[i].title })
                }
                $w('#services').options = services;
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

function servicesOther() {
    if ($w('#services').value.includes("Other not listed - please specify")) $w('#other').expand();
    else $w('#other').collapse();
}
// ===================================================== VALIDATION =====================================================
// ======= ONE =======
function B1Next(){
    $w('#textValidation1').collapse();
    try {
        checkValidationOne();
        $w('#statebox8').changeState("2");
    } catch (err) {
        $w('#textValidation1').text = err.message;
        $w('#textValidation1').expand();
    }
}

function checkValidationOne() {

    if (!$w('#company').valid) throw new Error('Missing Company Name');
    if (!$w('#OfficeAddress').valid) throw new Error('Missing Office Address');
    if (!$w('#phone').valid) throw new Error('Missing Phone');
    if (!$w('#website').valid) throw new Error('Missing Website');

    if (!$w('#mainName').valid) throw new Error('Missing Name in Main Contact');
    if (!$w('#mainTitle').valid) throw new Error('Missing Title in Main Contact');
    if (!$w('#mainPhone').valid) throw new Error('Missing Phone in Main Contact');
    if (!$w('#mainEmail').valid) throw new Error('Missing Email in Main Contact');

    if (!$w('#secondaryName').valid) throw new Error('Missing Name in Secondary Contact');
    if (!$w('#secondaryTitle').valid) throw new Error('Missing Title in Secondary Contact');
    if (!$w('#secondaryPhone').valid) throw new Error('Missing Phone in Secondary Contact');
    if (!$w('#secondaryEmail').valid) throw new Error('Missing Email in Secondary Contact');

    if (!$w('#accountsName').valid) throw new Error('Missing Name in Account Contact');
    if (!$w('#accountsTitle').valid) throw new Error('Missing Title in Account Contact');
    if (!$w('#accountsPhone').valid) throw new Error('Missing Phone in Account Contact');
    if (!$w('#accountsEmail').valid) throw new Error('Missing Email in Account Contact');

}

// ======= TWO =======
function B2Next(){
    $w('#textValidation2').collapse();
    try {
        checkValidationTwo();
        $w('#statebox8').changeState("3");
    } catch (err) {
        $w('#textValidation2').text = err.message;
        $w('#textValidation2').expand();
    }
}

function checkValidationTwo() {

    if (!$w('#yearsOperation').valid) throw new Error('Missing Years in operation');
    if (!$w('#fullTimeStaff').valid) throw new Error('Missing Full-time staff');
    if (!$w('#services').valid) throw new Error('Missing Services');
    if (!$w('#haveYouEverOperated').valid) throw new Error('Missing Have you ever operated in this industry under another trading name?');
    if ($w('#haveYouEverOperated').value == "Yes"){
        if (!$w('#tradingName').valid) throw new Error('Missing Traiding name');
    }
    if (!$w('#accreditedYesNo').valid) throw new Error('Missing Are you accredited to any ISO/NZ/AUS Standards?');
    if ($w('#accreditedYesNo').value == "Yes"){
        if (!$w('#accreditedIfYes').valid) throw new Error('Missing Accredited to any ISO/NZ/AUS Standards');
    }
    if (!$w('#license').valid) throw new Error('Missing Are you accredited to any Do you hold an Asbestos Removal or Assessor License?');
    if ($w('#license').value == "Yes"){
        if (!$w('#licenseExpiryDate').valid) throw new Error('Missing License Expiry Date');
        if (!$w('#licenseExpiryDate').valid) throw new Error('Missing License number');
    }
    if (!$w('#percentage').valid) throw new Error('Missing What percentage of your business is Demolition or Asbestos related?');
}

// ======= THREE =======
function B3Next(){
    $w('#textValidation3').collapse();
    try {
        checkValidationThree();
        $w('#statebox8').changeState("4");
    } catch (err) {
        $w('#textValidation3').text = err.message;
        $w('#textValidation3').expand();
    }
}

function checkValidationThree() {

    if (!$w('#documentedHealthYesNo').valid) throw new Error('Missing Do you have a documented health & safety system?');
    if ($w('#documentedHealthYesNo').value == "No"){
        if (!$w('#documentedHealth').valid) throw new Error('Missing describe Do you have a documented health & safety system?');
    }

    if (!$w('#noticesYesNo').valid) throw new Error('Missing Have you received any notices, fines or been prosecuted by WorkSafe in the last 5yrs?');
    if ($w('#noticesYesNo').value == "Yes"){
        if (!$w('#notices').valid) throw new Error('Missing describe Have you received any notices, fines or been prosecuted by WorkSafe in the last 5yrs?');
    }

    if (!$w('#eventsSeriousHarms').valid) throw new Error('Missing Have you had any notifiable events or serious harms in the last 5yrs?');

    if (!$w('#eventsSeriousHarms').valid) throw new Error('Missing Have you received any notices, fines or been prosecuted by WorkSafe in the last 5yrs?');
    if ($w('#environmentalAbatementYesNo').value == "Yes"){
        if (!$w('#environmentalAbatement').valid) throw new Error('Missing describe Have you received any environmental abatement or other notices?');
    }

    if (!$w('#commendationsYesNo').valid) throw new Error('Missing Have you received any commendations or awards for your work?');
    if ($w('#commendationsYesNo').value == "Yes"){
        if (!$w('#commendations').valid) throw new Error('Missing describe Have you received any commendations or awards for your work?');
    }

    if (!$w('#associationsYesNo').valid) throw new Error('Missing Are you a member of any other associations?');
    if ($w('#associationsYesNo').value == "Yes"){
        if (!$w('#associations').valid) throw new Error('Missing describe Are you a member of any other associations?');
    }
}

// ======= FOUR =======
async function sendForm(){
    $w('#textValidation4').collapse();
    try {
        checkValidationFour();
        //console.log('Ok')
        await send();
        wixLocation.to('/thank-you');
    } catch (err) {
        $w('#textValidation4').text = err.message;
        $w('#textValidation4').expand();
    }
}

function checkValidationFour() {

    if (!$w('#primaryProvider').valid) throw new Error('Missing Your primary fuel provider');
    if (!$w('#primaryHeathAndSafety').valid) throw new Error('Missing Your primary health and safety supplies provider');
    //console.log($w('#consent').checked)
    if (!$w('#consent').checked) throw new Error('Missing Concent to information');
    if (!$w('#name').valid) throw new Error('Missing Name');
    if (!$w('#companyEnd').valid) throw new Error('Missing Company');
    if (!$w('#signed').valid) throw new Error('Missing Signed');
    if (!$w('#position').valid) throw new Error('Missing Position');
    if ($w('#signature').value == "") throw new Error('Missing Signature');

}

// ===================================================== SEND FORM =====================================================
async function send() {
    let services = "";
    for (let i = 0; i < $w('#services').value.length; i++) {
        services += $w('#services').value[i] + "\n"
    }

    let json = {
        "company": $w('#company').value,
        "OfficeAddress": $w('#OfficeAddress').value.formatted,
        "phone": $w('#phone').value,
        "website": $w('#website').value,
        "mainName": $w('#mainName').value,
        "mainTitle": $w('#mainTitle').value,
        "mainPhone": $w('#mainPhone').value,
        "mainEmail": $w('#mainEmail').value,
        "secondaryName": $w('#secondaryName').value,
        "secondaryTitle": $w('#secondaryTitle').value,
        "secondaryPhone": $w('#secondaryPhone').value,
        "secondaryEmail": $w('#secondaryEmail').value,
        "accountsName": $w('#accountsName').value,
        "accountsTitle": $w('#accountsTitle').value,
        "accountsPhone": $w('#accountsPhone').value,
        "accountsEmail": $w('#accountsEmail').value,
        "yearsOperation": $w('#yearsOperation').value,
        "fullTimeStaff": $w('#fullTimeStaff').value,
        "services": services,
        "other": $w('#other').value,
        "haveYouEverOperated": $w('#haveYouEverOperated').value,
        "tradingName": $w('#tradingName').value,
        "accreditedYesNo": $w('#accreditedYesNo').value,
        "accreditedIfYes": $w('#accreditedIfYes').value,
        "percentage": $w('#percentage').value,
        "license": $w('#license').value,
        "licenseExpiryDate": $w('#licenseExpiryDate').value,
        "licenseNumber": $w('#licenseNumber').value,
        "checkA": $w('#checkA').checked,
        "checkB": $w('#checkB').checked,
        "assessor": $w('#assessor').checked,
        "documentedHealthYesNo": $w('#documentedHealthYesNo').value,
        "documentedHealth": $w('#documentedHealth').value,
        "noticesYesNo": $w('#noticesYesNo').value,
        "notices": $w('#notices').value,
        "eventsSeriousHarms": $w('#eventsSeriousHarms').value,
        "environmentalAbatementYesNo": $w('#environmentalAbatementYesNo').value,
        "environmentalAbatement": $w('#environmentalAbatement').value,
        "commendationsYesNo": $w('#commendationsYesNo').value,
        "commendations": $w('#commendations').value,
        "associationsYesNo": $w('#associationsYesNo').value,
        "associations": $w('#associations').value,
        "primaryProvider": $w('#primaryProvider').value,
        "primaryHeathAndSafety": $w('#primaryHeathAndSafety').value,
        "consent": $w('#consent').value,
        "name": $w('#name').value,
        "companyEnd": $w('#companyEnd').value,
        "signed": $w('#signed').value,
        "position": $w('#position').value,
        "date": $w('#date').value,
        "signature": $w('#signature').value
    }
    //console.log(json)
    eMail(json);
    await wixData.insert('DemolitionAsbestosForm', json);
}

// ===================================================== DATE =====================================================
function date() {
    let date = new Date();
    $w('#date').value = date.toDateString();
}
