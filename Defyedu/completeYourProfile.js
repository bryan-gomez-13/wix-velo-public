import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
var role, json

$w.onReady(function () {
    getProfile();
    init();
    drop();
});

function init() {
    $w('#save').onClick(() => check())
}

// ========================================= DROP ========================================= 
async function drop() {
    await wixData.query("States").ascending('state').find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].state, value: results.items[i]._id })
            }
            $w('#state').options = array;
        }).catch((err) => console.log(err))

    let minYear = 1950
    let date = new Date()
    let maxYear = date.getFullYear()
    let arrayYears = []
    for (let i = maxYear; i > minYear; i--) {
        arrayYears.push({ label: i+"", value: i+"" })
    }
    $w('#hsGraduationYear').options = arrayYears;
    $w('#hsGraduationYear').value = maxYear+""
}

// ========================================= GET PROFILE =========================================
function getProfile() {
    currentMember.getMember()
        .then(async (member) => {
            await wixData.query("users").eq('privateId', member._id).find()
                .then((results) => {
                    if (results.items.length > 0 && results.items[0].completeProfile == false) {
                        json = results.items[0]
                        role = json.role
                        $w('#welcome').text = "Welcome " + json.firstName
                        if (json.role == "High School Student") {
                            $w('#major').label = "Desired Major"
                            $w('#boxProfile').show();
                            $w('#BOX').scrollTo();
                        } else if (json.role == "Parents") {
                            $w('#hsName').collapse();
                            $w('#hsGraduationYear').collapse();
                            $w('#city').collapse();
                            $w('#state').collapse();
                            $w('#collegeYouWishToAttend').collapse();
                            $w('#major').collapse();

                            $w('#boxProfile').show();
                            $w('#boxProfile').scrollTo();
                        } else if (json.role == "College Student" || json.role == "College Graduate" || json.role == "Counselor") {
                            $w('#hsName').collapse();
                            $w('#hsGraduationYear').collapse();
                            $w('#city').collapse();
                            $w('#state').collapse();
                            $w('#collegeYouWishToAttend').collapse();
                            $w('#major').collapse();
                            $w('#wildCardA').collapse();
                            $w('#wildCardB').collapse();

                            $w('#boxProfile').show();
                            $w('#boxProfile').scrollTo();
                        }
                    } else $w('#welcome').text = "Your profile is complete";
                }).catch((err) => console.log(err));
        }).catch((error) => console.error(error));
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
    // Roles
    if (role == "High School Student") {
        if (!$w('#hsName').valid) throw new Error('Missing HS Name');
        if (!$w('#hsGraduationYear').valid) throw new Error('Missing HS Graduation Year');
        if (!$w('#city').valid) throw new Error('Missing City');
        if (!$w('#state').valid) throw new Error('Missing HS State');

        if (!$w('#myStory').valid) throw new Error('Missing HS My Story');
    } else if (role == "Parents") {
        if (!$w('#myStory').valid) throw new Error('Missing HS My Story');
    } else if (role == "College Student" || role == "College Graduate" || role == "Counselor")
        if (!$w('#myStory').valid) throw new Error('Missing HS My Story');
}

async function save() {
    $w('#loading').show();
    // Roles
    if (role == "High School Student") {
        json.hsName = $w('#hsName').value
        json.hsGraduationYear = parseInt($w('#hsGraduationYear').value)
        json.city = $w('#city').value
        json.state = $w('#state').value

        json.myStory = $w('#myStory').value
        if ($w('#collegeYouWishToAttend').value.length > 0) json.collegeYouWishToAttend = $w('#collegeYouWishToAttend').value
        if ($w('#major').value.length > 0) json.major = $w('#major').value
        json.wildCardA = $w('#wildCardA').checked
        json.wildCardB = $w('#wildCardB').checked

    } else if (role == "Parents") {
        json.myStory = $w('#myStory').value
        json.wildCardA = $w('#wildCardA').checked
        json.wildCardB = $w('#wildCardB').checked
    } else if (role == "College Student" || role == "College Graduate" || role == "Counselor") json.myStory = $w('#myStory').value

    json.completeProfile = true

    await wixData.update("users", json, { 'suppressAuth': true }).then(async (result) => {
        $w('#loading').hide();
        $w('#message').text = "Done"

        wixLocation.to('/account/my-account')
    })

}