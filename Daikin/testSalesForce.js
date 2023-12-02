import { createRecordsWrapper } from 'backend/salesforce.jsw';

$w.onReady(function () {
    init();
});

function init() {
    $w('#submit').onClick(() => checkRequest());
}

// ============================================ Save Request ============================================
async function checkRequest() {
    $w("#msgText").collapse();
    $w("#submit").disable();

    try {
        check();
        createRecord();
    } catch (Error) {
        console.log(Error)
        $w('#loading').collapse();
        $w('#msgText').text = Error.message;
        $w('#msgText').expand();
        $w('#submit').enable();
    }
}

function check() {
    if (!$w("#firstName").valid) throw new Error("Missing First Name");
    if (!$w("#lastName").valid) throw new Error("Missing Last Name");
    if (!$w("#phone").valid) throw new Error("Missing Phone Number");
    if (!$w("#email").valid) throw new Error("Missing Email");
    if (!$w("#streetAddress").valid) throw new Error("Missing Street Address");
    if (!$w("#suburb").valid) throw new Error("Missing Suburb");
    if (!$w("#postCode").valid) throw new Error("Missing Postcode");
    if (!$w("#state").valid) throw new Error("Missing State");
    if (!$w("#installationType").valid) throw new Error("Missing Describe your installation");
    if (!$w("#comments").valid) throw new Error("Missing Message");
    if (!($w("#captcha").token !== undefined)) throw new Error("CAPTCHA authorization failed.");
}

async function createRecord() {
    if (!$w('#msgText').collapsed) {
        closeMsgBox();
    }
    $w('#loading').expand();
    const FirstName = $w('#firstName').value;
    const LastName = $w('#lastName').value;
    const Phone = $w('#phone').value;
    const Email = $w('#email').value;
    const Street = $w('#streetAddress').value;
    const City = $w('#suburb').value;
    const PostalCode = $w('#postCode').value;
    const StateCode = $w('#state').value;
    const InstallationType__c = $w('#installationType').value;
    const Comments__c = $w('#comments').value;
    const CountryCode = 'AU';
    const LeadSource = 'Web';
    const Status = 'WebLeadCreated';
    const RecordTypeId = '012900000012NnOAAU';
    try {
        const res = await createRecordsWrapper({ FirstName, LastName, Phone, Email, Street, City, PostalCode, StateCode, InstallationType__c, Comments__c, CountryCode, LeadSource, Status, RecordTypeId });
        console.log(res)
        clearFields();
        if (res) {
            showExecutionMsg('Your record was added.');
        } else {
            showExecutionMsg('Error: Your record was not added.');
        }
    } catch (err) {
        showExecutionMsg(err.toString());
    }
    $w('#loading').collapse();
}

function showExecutionMsg(msg) {
    $w('#msgText').text = msg;
    $w('#msgText').expand();
}

function closeMsgBox() {
    $w('#msgText').collapse();
    $w('#loading').collapse();
}

function clearFields() {
    $w('#firstName').value = '';
    $w('#lastName').value = '';
    $w('#phone').value = '';
    $w('#email').value = '';
    $w('#streetAddress').value = '';
    $w('#suburb').value = '';
    $w('#postCode').value = '';
    $w('#state').value = '';
    $w('#installationType').value = '';
    $w('#comments').value = '';

    $w('#firstName').resetValidityIndication();
    $w('#lastName').resetValidityIndication();
    $w('#phone').resetValidityIndication();
    $w('#email').resetValidityIndication();
    $w('#streetAddress').resetValidityIndication();
    $w('#suburb').resetValidityIndication();
    $w('#postCode').resetValidityIndication();
    $w('#state').resetValidityIndication();
    $w('#installationType').resetValidityIndication();
    $w('#comments').resetValidityIndication();
}