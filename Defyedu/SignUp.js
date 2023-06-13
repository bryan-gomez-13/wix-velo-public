import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { signUp } from 'backend/SignUp.jsw'

var Image, imageId
$w.onReady(function () {
    init();
    drop();
});

function init() {
    //All
    $w('#role').onChange(() => roleFields($w('#role').value))

    //Fields
    /*
    $w('#check16Y').onChange(() => {
        if ($w('#check16Y').value == 'Yes' && $w('#tc').checked) $w('#save').enable()
        else $w('#save').disable()
    })

    $w('#check18Y').onChange(() => {
        if ($w('#check18Y').value == 'Yes' && $w('#tc').checked) $w('#save').enable()
        else $w('#save').disable()
    })
    
    $w('#tc').onChange(() => {
        if ($w('#tc').checked) $w('#save').enable()
        else $w('#save').disable()
    })
    */

    $w('#email').onInput(() => getEmail())

    //Photo
    $w('#profilePhoto').onChange(() => uploadPicture())

    // Save user
    $w('#save').onClick(() => check());
}

// ========================================= Drop states ========================================= 
async function drop() {
    await wixData.query("Roles").ascending('order').find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i].title })
            }
            $w('#role').options = array;
            $w('#role').enable();
        }).catch((err) => console.log(err))
}

// ========================================= Control the fields of roles =========================================
function roleFields(field) {
    console.log($w('#role').value)
    $w('#box2').show();
    if (field == "High School Student") {
        $w('#check18YG').collapse();
        $w('#check16YG').expand();
        $w('#tc').expand();

    } else if (field == "Parents") {
        $w('#check16YG').collapse();
        $w('#check18YG').expand();
        $w('#tc').collapse();
        
    } else if (field == "College Student" || field == "College Graduate" || field == "Counselor") {
        $w('#tc').collapse();
        $w('#check18YG').collapse();
        $w('#check16YG').collapse();

    } else if (field == "Sponsor") {
        $w('#tc').expand();

        $w('#check16YG').collapse();
        $w('#check18YG').collapse();
    }
}

// ========================================= GET EMAIL ========================================= 
async function getEmail() {
    $w('#message').collapse();
    await wixData.query("users").eq('email', $w('#email').value).find()
        .then((results) => {
            if (results.items.length > 0) {
                $w('#message').text = "This email alredy exist."
                $w('#message').expand()
                $w('#message').scrollTo()
                $w('#save').disable()
            }else $w('#save').enable()

        }).catch((err) => console.log(err));
}

// ========================================= SAVE ========================================= 
function check() {
    $w('#message').collapse();
    $w('#save').disable()
    try {

        checkValidation();
        save();

    } catch (err) {
        $w('#message').text = err.message;
        $w('#message').expand();
        $w('#message').scrollTo();
        $w('#save').enable();
    }
}

function checkValidation() {
    if (!($w("#profilePhoto").value.length > 0)) throw new Error('Missing Profile Photo');
    if (!$w('#firstName').valid) throw new Error('Missing First name');
    if (!$w('#lastName').valid) throw new Error('Missing Last name');
    if (!$w('#email').valid) throw new Error('Missing Email');
    if (!$w('#pass').valid) throw new Error('Missing password');
    if ($w('#pass').value.length < 6) throw new Error('Password should contain at least 6 characters');

    // Roles
    if ($w('#role').value == "High School Student") {
        if (!$w('#check16Y').valid || $w('#check16Y').value == 'No') throw new Error('You must be 16 or older to be a student.\nAlternatively, Student may request Parents to Subscribe');
        if (!$w('#tc').valid) throw new Error('Check Terms and conditions');
    } else if ($w('#role').value == "Parents") {
        if (!$w('#check18Y').valid || $w('#check18Y').value == 'No') throw new Error('You must be 18 or older to be a parent');
    } else if ($w('#role').value == "Sponsor"){
        if (!$w('#tc').valid) throw new Error('Check Terms and conditions');
    }
}

async function save() {
    $w('#loading').show();
    let json = {
        privateId: "id",
        role: $w('#role').value,
        firstName: $w('#firstName').value,
        lastName: $w('#lastName').value,
        picture: Image,
        email: $w('#email').value,
        premium: false,
        completeProfile: false
    }
    // Roles
    if ($w('#role').value == "High School Student") {
        json['16YearsOld'] = $w('#check16Y').value
        json.tc = $w('#tc').checked
    } else if ($w('#role').value == "Parents") {
        json['18YearsOld'] = $w('#check18Y').value
    }else if ($w('#role').value == "Sponsor") {
        json.premium = true
        json.tc= $w('#tc').checked
    }

    await signUp(json, $w('#pass').value, imageId).then(async (result) => {
        if (result.type === 'success') {
            json.privateId = result.id
            await wixData.insert("users", json)
            await wixUsers.applySessionToken(result.sessionToken)
            $w('#loading').hide();
            $w('#message').text = result.message;
            $w('#message').expand();
            if ($w('#role').value == "Sponsor") setTimeout(() => wixLocation.to('/'), 1000);
            else setTimeout(() => wixLocation.to('/account/my-account'), 1000);

        } else {
            console.error(`${result.type} error occurred. Error message: ${result.message}`);
            $w('#loading').hide();
            $w('#message').text = `${result.type} error occurred.`;
            $w('#message').expand();
        }
    })
}

// ========================================= PICTURE =========================================
async function uploadPicture() {
    $w("#photo").src = "https://miro.medium.com/max/296/0*0kRsDyQ0V3rxEzFy.gif";
    if ($w("#profilePhoto").value.length > 0) { // user chose a file
        await $w("#profilePhoto").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    //console.log(uploadedFile)
                    //console.log(uploadedFile.fileUrl)
                    $w('#profilePhoto').label = ""
                    $w("#photo").src = uploadedFile.fileUrl
                    //$w("#image").expand();
                    Image = uploadedFile.fileUrl;
                    imageId = "https://static.wixstatic.com/media/" + uploadedFile.fileName

                    $w("#message").collapse();
                })
            })
            .catch((uploadError) => {
                $w("#message").text = "Error: " + uploadError.errorDescription;
                $w("#message").expand();
            });
    } else { // user clicked button but didn't chose a file
        $w('#photo').src = "wix:image://v1/73f5ce_d7c6bfa5333a4a79b6b3a93b9827666d~mv2.png/_.png#originWidth=1025&originHeight=1025"
        $w('#profilePhoto').label = "Upload new photo"
        $w("#message").text = "Please choose a file to upload.";
        $w("#message").expand();
    }
}