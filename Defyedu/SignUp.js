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

    await wixData.query("States").ascending('state').find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].state, value: results.items[i]._id })
            }
            $w('#state').options = array;
        }).catch((err) => console.log(err))
}

// ========================================= Control the fields of roles =========================================
function roleFields(field) {
    console.log($w('#role').value)
    $w('#box2').show();
    if (field == "High School Student") {
        $w('#check16YG').expand();

        $w('#check18YG').collapse();
        $w('#city').collapse();
        $w('#state').collapse();
        $w('#messageCCC').collapse();
        $w('#university').collapse();
        $w('#major').collapse();
        $w('#highestCollegeDegree').collapse();
    } else if (field == "Parents") {
        $w('#check18YG').expand();
        $w('#city').expand();
        $w('#state').expand();

        $w('#check16YG').collapse();
        $w('#messageCCC').collapse();
        $w('#university').collapse();
        $w('#major').collapse();
        $w('#highestCollegeDegree').collapse();
    } else if (field == "College Student" || field == "College Graduate" || field == "Counselor") {
        $w('#city').expand();
        $w('#state').expand();
        $w('#university').expand();
        $w('#major').expand();
        if (field !== "College Student") $w('#highestCollegeDegree').expand();
        else $w('#highestCollegeDegree').collapse();

        $w('#check18YG').collapse();
        $w('#check16YG').collapse();

        //$w('#save').enable()

        if (field == "College Student") $w('#messageCCC').text = "Currently enrolled at", $w('#messageCCC').expand();
        else if (field == "College Graduate" || field == "Counselor") $w('#messageCCC').text = "College Background", $w('#messageCCC').expand();

    } else if (field == "Sponsor") {
        $w('#check16YG').collapse();
        $w('#check18YG').collapse();
        $w('#city').collapse();
        $w('#state').collapse();
        $w('#messageCCC').collapse();
        $w('#university').collapse();
        $w('#major').collapse();
        $w('#highestCollegeDegree').collapse();

        //$w('#save').enable()
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
            }

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
        if (!$w('#check16Y').valid) throw new Error('You must be 16 or older to be a student.\nAlternatively, Student may request Parents to Subscribe');
    } else if ($w('#role').value == "Parents") {
        if (!$w('#check18Y').valid) throw new Error('You must be 18 or older to be a parent');
        if (!$w('#city').valid) throw new Error('Missing City');
        if (!$w('#state').valid) throw new Error('Missing State');
    } else if ($w('#role').value == "College Student" || $w('#role').value == "College Graduate" || $w('#role').value == "Counselor") {
        if (!$w('#city').valid) throw new Error('Missing City');
        if (!$w('#state').valid) throw new Error('Missing State');
        if (!$w('#university').valid) throw new Error('Missing University');
        if (!$w('#major').valid) throw new Error('Missing Major');
        if (!$w('#highestCollegeDegree').valid && $w('#role').value !== "College Student") throw new Error('Missing Highest College Degree');
    }

    if (!$w('#tc').valid) throw new Error('Check Terms and conditions');

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
        tc: $w('#tc').checked,
        premium: false,
        completeProfile: false
    }
    // Roles
    if ($w('#role').value == "High School Student") {
        json['16YearsOld'] = $w('#check16Y').value
    } else if ($w('#role').value == "Parents") {
        json['18YearsOld'] = $w('#check18Y').value
        json.city = $w('#city').value
        json.state = $w('#state').value
    } else if ($w('#role').value == "College Student" || $w('#role').value == "College Graduate" || $w('#role').value == "Counselor") {
        json.city = $w('#city').value
        json.state = $w('#state').value
        json.university = $w('#university').value
        json.major = $w('#major').value
        if ($w('#role').value !== "College Student") json.highestCollegeDegree = $w('#highestCollegeDegree').value
    }

    await signUp(json, $w('#pass').value, imageId).then(async (result) => {
        if (result.type === 'success') {
            json.privateId = result.id
            await wixData.insert("users", json)
            await wixUsers.applySessionToken(result.sessionToken)
            $w('#loading').hide();
            $w('#message').text = result.message;
            $w('#message').expand();
            setTimeout(() => wixLocation.to('/get-premium'), 1000);
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
        $w("#message").text = "Please choose a file to upload.";
        $w("#message").expand();
    }
}