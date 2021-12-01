import wixData from 'wix-data';
import { eMail_1 } from 'backend/emails'

var Name, Email, MobileNumber, ForwardingAddress, CompleteAdress, Birthday, TypeID, MembershipPeriod;
let emailSame = false;

$w.onReady(function () {
    buttons();
});



export async function registerMembers() {

    if (isValidForm()) {
        $w("#saveUser").save();

        let addressComplete = {
            "city": $w('#CompleteAdress').value.city,
            "country": $w('#CompleteAdress').value.country,
            "formatted": $w('#CompleteAdress').value.formatted,
            "postalCode": $w('#CompleteAdress').value.postalCode,
            "streetAddress": {
                "name": $w('#CompleteAdress').value.streetAddress.name,
                "number": $w('#CompleteAdress').value.streetAddress.number
            }
        }

        let addressForwarding = {
            "city": $w('#ForwardingAddress').value.city,
            "country": $w('#ForwardingAddress').value.country,
            "formatted": $w('#ForwardingAddress').value.formatted,
            "postalCode": $w('#ForwardingAddress').value.postalCode,
            "streetAddress": {
                "name": $w('#ForwardingAddress').value.streetAddress.name,
                "number": $w('#ForwardingAddress').value.streetAddress.number
            }
        }

        $w("#saveUser").setFieldValues({
            "fullName": $w("#Name").value,
            "mobileNumber": parseInt($w("#MobileNumber").value),
            "email": $w("#Email").value,
            "completeAddress": addressComplete,
            "forwardingAddress": addressForwarding,
            "birthday": $w('#Birthday').value.toDateString(),
            "typeId": $w("#TypeID").value,
            "confirm": $w('#Confirm').value,
            "membershipPeriod": $w("#MembershipPeriod").value,
            "suiteId": "Pending activation",
            "active": false,
            "endPlan": "Pending activation",
            "days": null,
            "myItems": []
        })
        eMail_1($w("#Email").value);
        console.log("save");
    } else {
        $w('#text124').expand();
    }
}

export async function validEmails() {
    if ($w('#Email').value === $w('#input1').value) {
        emailSame = true;
    } else {
        emailSame = false;
    }
    console.log(emailSame);
    return emailSame;
}
export async function isValidForm() {
    let result = $w('#Name').valid && $w('#MobileNumber').valid && $w('#Email').valid && $w('#CompleteAdress').valid && $w('#ForwardingAddress').valid && $w('#Birthday').valid && $w('#Gender').valid && $w('#Confirm').valid && $w('#TypeID').valid && $w('#MembershipPeriod').valid && $w('#input1').valid;
    console.log(result);
    return result;
}

//Update

export async function updateImage() {
    await $w("#YourIDImage").uploadFiles()
        .then(() => {
            return $w('#YourIDImage').valid;
        })
        .catch((uploadError) => {
            let errCode = uploadError.errorCode; // 7751
            let errDesc = uploadError.errorDescription; // "Error description"
            console.log(errCode, errDesc)
        });
    return $w('#YourIDImage').valid;
}
/*
export async function updateDocument(){
    await $w("#YourIDDocument").uploadFiles()
    .then( () => {
        return $w('#YourIDDocument').valid;
    })
    .catch( (uploadError) => {
        let errCode = uploadError.errorCode;  // 7751
        let errDesc = uploadError.errorDescription; // "Error description"
        console.log(errCode, errDesc)
    } );
    return $w('#YourIDDocument').valid
}
//Change the file
export function changeTypeID(event) {
	let type = $w('#radioTypeID').value;
    if(type == "Image"){
        $w('#YourIDDocument').hide();
        $w('#YourIDImage').show();
    }else{
        $w('#YourIDDocument').show();
        $w('#YourIDImage').hide();
    }
}*/

export function input1_change(event) {
    if ($w('#Email').value === $w('#input1').value) {
        $w('#Pass').enable();
        $w('#text127').hide();
    } else {
        $w('#Pass').disable();
        $w('#text127').show();
    }
}

export function Email_change(event) {
    wixData.query("Users").eq("email", $w('#Email').value)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w('#text128').show();
                $w('#Email').updateValidityIndication()
            } else {
                $w('#text128').hide();
                $w('#input1').enable();
            }

        })
}

export function buttons() {
    $w('#Register').onClick(() => registerMembers());

    //CONFIRM
    $w('#Name').onInput(() => confirm());
    $w('#MobileNumber').onInput(() => confirm());
}

function confirm(){
    let fullName = false;
    if($w('#Name').valid){
        fullName = true;
    }else{
        $w('#Name').focus();
    }
    console.log("1",$w('#Name').valid);

    console.log("2",$w('#MobileNumber').valid);
}