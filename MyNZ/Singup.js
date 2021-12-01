import wixUsers from 'wix-users';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { doRegistration } from 'backend/signIn.jsw';

var Image = null;
var Document = null;

$w.onReady(function () {
    if (wixUsers.currentUser.loggedIn) {
        setTimeout(() => wixLocation.to('/home'), 0);
        wixWindow.lightbox.close();
    } else {
        init();
    }
});

function init() {

    onClickSignIn();
    $w('#email').onInput(() => searchEmail());
    $w('#fileType').onChange(() => changeTypeID());

}

function onClickSignIn() {
    $w('#signInBtn').onClick(async () => {
        $w('#textValidation').collapse();
        $w('#signInBtn').disable();
        try {
            if ($w('#uploadDocument').value.length > 0 || $w('#uploadImage').value.length > 0) {
                checkValidation();
                await register();
            } else {
                $w('#textValidation').text = 'Please upload your ID';
                $w('#textValidation').expand();
                $w('#signInBtn').enable();
            }

        } catch (err) {
            $w('#textValidation').text = err.message;
            $w('#textValidation').expand();
            $w('#signInBtn').enable();
        }
    });
}

// ====================================== CHECK IF ALL THE FIELDS IS OK ====================================== 
function checkValidation() {
    console.log('here')
    if (!$w('#fullName').valid) throw new Error('Missing name');
    if (!$w('#surname').valid) throw new Error('Missing surname');
    if (!$w('#mobilePhone').valid) throw new Error('Missing mobile phone');
    if (!$w('#email').valid) throw new Error('Missing email');
    if (!$w('#password').valid) throw new Error('Missing password');
    if ($w('#password').value.length < 6) throw new Error('Password should contain at least 6 characters');
    if (!$w('#secondPassword').valid) throw new Error('Missing password confirmation');
    if ($w('#password').value !== $w('#secondPassword').value) throw new Error('Passwords are not identical');
    if (!$w('#gender').valid) throw new Error('Missing gender');
    if (!$w('#confirmYes').valid) throw new Error('Missing confirm');
    if (!$w('#IDType').valid) throw new Error('Missing photo identification');
    if (!$w('#membership').valid) throw new Error('Missing membership');

}

// ====================================== SAVE INFORMATION ====================================== 
async function register() {
    $w('#textValidation').text = 'Saving the information, do not close the page';
    $w('#textValidation').expand();

    let addressComplete = {
        "city": $w('#completeAddress').value.city,
        "country": $w('#completeAddress').value.country,
        "formatted": $w('#completeAddress').value.formatted,
        "postalCode": $w('#completeAddress').value.postalCode,
        "streetAddress": {
            "name": $w('#completeAddress').value.streetAddress.name,
            "number": $w('#completeAddress').value.streetAddress.number
        }
    }

    let addressForwarding = {
        "city": $w('#forwardingAddress').value.city,
        "country": $w('#forwardingAddress').value.country,
        "formatted": $w('#forwardingAddress').value.formatted,
        "postalCode": $w('#forwardingAddress').value.postalCode,
        "streetAddress": {
            "name": $w('#forwardingAddress').value.streetAddress.name,
            "number": $w('#forwardingAddress').value.streetAddress.number
        }
    }

    if ($w('#fileType').value == "Image") {
        await uploadImage();
        console.log("IMAGE", Image)
    } else {
        await uploadDocument();
        console.log("DOCUMENT", Document)
    }

    let json = {
        'idPrivateMember': null,
        'email': $w('#email').value,
        'fullName': $w('#fullName').value,
        'surname': $w('#surname').value,
        'mobileNumber': parseInt($w('#mobilePhone').value),
        'completeAddress': addressComplete,
        'forwardingAddress': addressForwarding,
        'birthday': $w('#birthday').value.toDateString(),
        'gender': $w('#gender').value,
        'confirm': $w('#confirmYes').value,
        'typeId': $w('#IDType').value,
        'membershipPeriod': $w('#membership').value,
        'typeDoc': $w('#fileType').value,
        'imageId': Image,
        'documentId': Document,
        'suiteId': "Pending activation",
        'active': false,
        'endPlan': "Pending activation",
        'days': null
    }

    console.log(json)

    const contactInfo = {
        'email': $w('#email').value,
        'password': $w('#password').value,
        'options': {
            'contactInfo': {
                'firstName': $w('#fullName').value,
                'lastName': $w('#surname').value,
                'mobileNumber': $w('#mobilePhone').value,
                'birthday': $w('#birthday').value.toDateString(),
                'gender': $w('#gender').value,
                'completeAddress': $w('#completeAddress').value.formatted,
                'forwardingAddress': $w('#forwardingAddress').value.formatted
            }
        }
    }
    const { approved } = await doRegistration(contactInfo, json);
    if (approved) {
        //wixWindow.lightbox.close();
        wixWindow.openLightbox("Message", {
            "email": json.email
        })
        $w('#checkEmail').expand();
        $w('#textValidation').collapse();
    } else {
        throw new Error('Registration failed.');
    }
}

// ====================================== SEARCH IF THIS EMAIL IS REGISTER ====================================== 
function searchEmail() {
    wixData.query("Users").eq("email", $w('#email').value)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w('#textValidation').text = "The mail already exists"
                $w('#textValidation').expand();
                $w('#signInBtn').disable();
            } else {
                $w('#textValidation').collapse();
                $w('#signInBtn').enable();
            }

        })
}

// ====================================== CHANGE THE TYPE IF THE DOCUMENT ====================================== 
export function changeTypeID() {
    let type = $w('#fileType').value;
    if (type == "Image") {
        $w('#uploadDocument').hide();
        $w('#uploadImage').show();
    } else {
        $w('#uploadDocument').show();
        $w('#uploadImage').hide();
    }
}

// ====================================== UPLOAD FILES - DOCUMENT OR IMAGE ====================================== 
export async function uploadDocument() {
    await $w("#uploadDocument").uploadFiles()
        .then((uploadedFiles) => {
            uploadedFiles.forEach(uploadedFile => {
                console.log(uploadedFile.fileUrl)
                Document = uploadedFile.fileUrl
            })
        })
        .catch((uploadError) => {
            console.log(uploadError)
        });
}

export async function uploadImage() {
    await $w("#uploadImage").uploadFiles()
        .then((uploadedFiles) => {
            uploadedFiles.forEach(async uploadedFile => {
                console.log(uploadedFile.fileUrl)
                Image = uploadedFile.fileUrl
            })
        })
        .catch((uploadError) => {
            console.log(uploadError)
        });
}