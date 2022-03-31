import wixData from 'wix-data';
import {eMail} from 'backend/email'

$w.onReady(function () {
    services();
    init();
});
// ===================================================== INIT =====================================================
function init() {
    //Buttons
    $w('#next1').onClick(() => $w('#statebox8').changeState("2"))
    $w('#next2').onClick(() => $w('#statebox8').changeState("3"))
    $w('#back1').onClick(() => $w('#statebox8').changeState("1"))
    $w('#back2').onClick(() => $w('#statebox8').changeState("2"))
    $w('#sendForm').onClick(() => send())

    //Yes/No
    $w('#haveYouEverOperated').onChange(() => {
        if ($w('#haveYouEverOperated').value == 'Yes') $w('#tradingName').expand();
        else $w('#tradingName').collapse();
    });
    $w('#accreditedYesNo').onChange(() => {
        if ($w('#accreditedYesNo').value == 'Yes') $w('#accreditedIfYes').expand();
        else $w('#accreditedIfYes').collapse();
    });
    $w('#accreditedYesNo').onChange(() => {
        if ($w('#accreditedYesNo').value == 'Yes') $w('#accreditedIfYes').expand();
        else $w('#accreditedIfYes').collapse();
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
function servicesOther(){
    if( $w('#services').value.includes("Other not listed - please specify") ){
        $w('#other').expand();
    }else{
        $w('#other').collapse();
    }
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
        "checkAB": $w('#checkAB').value,
        "assessor": $w('#assessor').value,
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
        "date": $w('#date').value.toDateString()
    }
    //console.log(json)
    eMail(json);
    await wixData.insert('DemolitionAsbestosForm', json)
}