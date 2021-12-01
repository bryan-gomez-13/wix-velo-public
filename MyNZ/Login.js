import wixData from 'wix-data';
import {eMail_1} from 'backend/emails'

var Name,Email,MobileNumber,ForwardingAddress,CompleteAdress,Birthday,TypeID,MembershipPeriod;

$w.onReady(function () {
    buttons();
});

export function buttons() {
    $w('#Register').onClick(() => registerMembers());
}

export async function registerMembers() {
	if (isValidForm()) {
        $w("#saveUser").save();

        let addressComplete = {
            "city": $w('#CompleteAdress').value.city,
            "country": $w('#CompleteAdress').value.country,
            "formatted": $w('#CompleteAdress').value.formatted,
            "postalCode": $w('#CompleteAdress').value.postalCode,
            "streetAddress" : {
                "name": $w('#CompleteAdress').value.streetAddress.name,
                "number": $w('#CompleteAdress').value.streetAddress.number
            }
        }

        let addressForwarding = {
            "city": $w('#ForwardingAddress').value.city,
            "country": $w('#ForwardingAddress').value.country,
            "formatted": $w('#ForwardingAddress').value.formatted,
            "postalCode": $w('#ForwardingAddress').value.postalCode,
            "streetAddress" : {
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
            "membershipPeriod": $w("#MembershipPeriod").value,
			"suiteId": "Pending activation",
            "active": false,
            "endPlan": "Pending activation",
            "days": null,
            "myItems":[]
		})
        eMail_1($w("#Email").value);
         console.log("save");
    } else {
        $w('#text124').expand();
    }
}

export async function isValidForm() {
    let result = $w('#Name').valid && $w('#MobileNumber').valid && $w('#Email').valid && $w('#CompleteAdress').valid && $w('#ForwardingAddress').valid && $w('#Birthday').valid && $w('#Gender').valid && $w('#Confirm').valid && $w('#TypeID').valid && $w('#MembershipPeriod').valid;
    console.log(result);
    return result;
}

//Update

export async function updateImage(){
    await $w("#YourIDImage").uploadFiles()
    .then( () => {
        return $w('#YourIDImage').valid;
    })
    .catch( (uploadError) => {
        let errCode = uploadError.errorCode;  // 7751
        let errDesc = uploadError.errorDescription; // "Error description"
        console.log(errCode, errDesc)
    } );
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