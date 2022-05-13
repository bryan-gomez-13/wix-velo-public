import { currentMember } from 'wix-members';
import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { doRegistration } from 'backend/signIn.jsw';

var yoga_teacher;
var train_yoga;
var qualification = "";

var Image = null;
var Document = null;

$w.onReady(function () {
    init();
    login();
})

function init() {
    $w('#picture').onChange(() => uploadPicture());
    //$w('#address').onChange(() => address());

    $w('#firstNo').onClick(() => fistNo());
    $w('#firstYes').onClick(() => fistYes());
    $w('#secondNo').onClick(() => secondNo());
    $w('#secondYes').onClick(() => secondYes());

    $w('#submit').onClick(() => submit());
    $w('#inputEmail').onInput(() => newEmail());

}

// ========================================= ADDRESS =========================================
async function login() {
    currentMember.getMember()
        .then((member) => {
            //console.log(member)
            if (member == undefined) {
                $w("#box").changeState('FirstQuestion');
                $w("#box").expand();
            } else {
                $w("#box").changeState('Member');
                $w("#box").expand();
            }

        })
        .catch((error) => {
            console.error(error);
        });
    /*
        let user = await wixUsers.currentUser;
        let isLoggedIn = user.loggedIn; // true

        if (isLoggedIn) {
            $w("#box").changeState('Member');
        }
        $w("#box").expand();
        $w("#box").show();

        if (!isLoggedIn && yoga_teacher == 'undefined' && train_yoga == 'undefined') {
            $w("#box").changeState('FirstQuestion');

        }
        */
}

// ========================================= NEW EMAIL =========================================
function newEmail() {
    wixData.query("UserDatabase")
        .eq("email", $w('#inputEmail').value)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                let firstItem = results.items[0]; //see item below
                $w('#textValidation').text = "The email used is already a site member."
                $w('#textValidation').expand();
                $w('#submit').disable();
            } else {
                $w('#textValidation').collapse();
                $w('#submit').enable();
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

// ========================================= PICTURE & DOCUMENT =========================================
async function uploadPicture() {
    $w("#image").src = "https://miro.medium.com/max/296/0*0kRsDyQ0V3rxEzFy.gif";
    if ($w("#picture").value.length > 0) { // user chose a file
        await $w("#picture").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    //console.log(uploadedFile.fileUrl)
                    $w("#image").src = uploadedFile.fileUrl
                    Image = uploadedFile.fileUrl;
                })
            })
            .catch((uploadError) => {
                $w("#textUpload").text = "Error: " + uploadError.errorDescription;
                $w("#textUpload").show();
            });
    } else { // user clicked button but didn't chose a file
        $w("#textUpload").text = "Please choose a file to upload.";
        $w("#textUpload").show();
    }
}

async function uploadDocument() {
    if ($w("#document").value.length > 0) { // user chose a file
        await $w("#document").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    Document = uploadedFile.fileUrl;
                })
            })
            .catch((uploadError) => {
                console.log(uploadError)
            });
    }
}

// ========================================= QUESTIONS =========================================
function fistNo() {
    yoga_teacher = false;
    $w("#box").changeState('Register');
    $w("#memberType").value = "General member";
    $w("#document").hide();
    $w("#input8").hide();
}

function fistYes() {
    yoga_teacher = true;
    $w("#box").changeState('SecondQuestion')
}

function secondNo() {
    train_yoga = false;
    if (yoga_teacher) {
        $w("#box").changeState('Register');
        $w("#memberType").value = "Other Teacher";
        $w("#document").show()
        $w("#input8").enable();
        $w("#input8").value = "";
        $w("#text85").show()
    }
}

function secondYes() {
    train_yoga = true;
    $w("#box").changeState('Register');
    if (yoga_teacher) {
        $w("#memberType").value = "IYTA Teacher";
        qualification = "IYTA Teaching Diploma Course";
        $w("#input8").value = qualification;
        $w("#input8").disable();
        $w("#document").hide();
    }
}

// ========================================= SUBMIT =========================================
async function submit() {
    $w('#textValidation').collapse();
    $w('#submit').disable();
    try {

        checkValidation();
        //console.log('Ok')
        await register();

    } catch (err) {
        $w('#textValidation').text = err.message;
        $w('#textValidation').expand();
        $w('#submit').enable();
    }
}

function checkValidation() {
    if (!$w('#inputFirstName').valid) throw new Error('Missing First Name');
    if (!$w('#inputLastName').valid) throw new Error('Missing Last Name');
    if (!$w('#inputEmail').valid) throw new Error('Missing Email');
    if (!$w('#inputPassword').valid) throw new Error('Missing password');
    if ($w('#inputPassword').value.length < 6) throw new Error('Password should contain at least 6 characters');
    if (!$w('#inputPhone').valid) throw new Error('Missing Phone');
    if($w('#inputWebsite').value.length > 0){
        if (!$w('#inputWebsite').valid) throw new Error('Start website with http://');
    }
    /*if (train_yoga == true) {
        if (!($w("#document").value.length > 0)) throw new Error('Missing Document');
    }*/
    if (!$w('#dropdown3').valid) throw new Error('Missing Region');
    //if (!($w('#address').value.city != undefined)) throw new Error('Missing Select Address');
    //if (!$w('#input4').valid) throw new Error('Missing Teaching Location');
    if (!$w('#address').valid) throw new Error('Missing Street Address');
    if (!$w('#input6').valid) throw new Error('Missing Town/City');
    if (!$w('#input5').valid) throw new Error('Missing PostCode');
    if (!$w('#input7').valid) throw new Error('Missing Country');
    if (!($w('#inputGender').value != '')) throw new Error('Missing Gender');
    if (!($w('#captcha1').token != undefined)) throw new Error('Missing reCAPTCHA');
}
// ========================================= REGISTER =========================================
async function register() {
    $w('#textValidation').text = 'Saving the information, do not close the page';
    $w('#textValidation').expand();

    await uploadDocument();

    let json = {
        'firstName': $w('#inputFirstName').value,
        'lastName': $w('#inputLastName').value,
        'email': $w('#inputEmail').value,
        'website': $w('#inputWebsite').value,
        'profilePicture': Image,
        'qualificationFile': Document,
        'region': $w('#dropdown3').value,
        'phone': $w('#inputPhone').value,
        'mobile': $w('#inputMobile').value,
        'address': $w('#address').value /*.formatted*/ ,
        'suburb': $w('#input3').value,
        'city': $w('#input6').value,
        'postcode': $w('#input5').value,
        'country': $w('#input7').value,
        'gender': $w('#inputGender').value,
        'membershipType': $w('#memberType').value,
        'teachingLocation': $w('#input4').value,
        'yogaQualification': $w('#input8').value
    }
    console.log(json);

    let jsonContact = {};
    //console.log(json)
    if ($w("#picture").value.length > 0) {
        jsonContact = {
            'email': $w('#inputEmail').value,
            'password': $w('#inputPassword').value,
            'options': {
                'contactInfo': {
                    'firstName': $w('#inputFirstName').value,
                    'lastName': $w('#inputLastName').value,
                    'picture': Image,
                    'mobileNumber': $w('#inputPhone').value,
                    'gender': $w('#inputGender').value
                }
            }
        }
    } else {
        jsonContact = {
            'email': $w('#inputEmail').value,
            'password': $w('#inputPassword').value,
            'options': {
                'contactInfo': {
                    'firstName': $w('#inputFirstName').value,
                    'lastName': $w('#inputLastName').value,
                    'mobileNumber': $w('#inputPhone').value,
                    'gender': $w('#inputGender').value
                }
            }
        }
    }
    const contactInfo = jsonContact;
    //console.log(contactInfo);

    const { approved } = await doRegistration(contactInfo, json);
    if (approved) {
        //wixWindow.lightbox.close();
        wixLocation.to("/become-a-member-thankyou");
        $w('#textValidation').collapse();
    } else {
        $w('#textValidation').text = 'Registration failed.';
        throw new Error('Registration failed.');
    }
}

// ========================================= ADDRESS =========================================
function address() {
    if ($w('#address2').value.city !== "") {
        $w('#input6').value = $w('#address2').value.city;
        $w('#input5').value = $w('#address2').value.postalCode;
    }
}