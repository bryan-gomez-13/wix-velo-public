import wixData from 'wix-data';
import { currentMember } from 'wix-members';
var json, stateV
var json2 = {
    hsName: "",
    hsGraduationYear: 0,
    city: "",
    state: "",
    stateV: "",
    myStory: "",
    university: "",
    major: "",
    college: "",
}

$w.onReady(async function () {
    await drop();
    getProfile();
    init();
});

function init() {
    $w('#hsName').onInput(() => change('hsName'))
    $w('#hsGraduationYear').onChange(() => change('hsGraduationYear'))
    $w('#city').onInput(() => change('city'))
    $w('#state').onChange(async () => { await stateValue(), change('state') })
    $w('#myStory').onInput(() => change('myStory'))
    $w('#university').onInput(() => change('university'))
    $w('#major').onInput(() => change('major'))
    $w('#college').onInput(() => change('college'))
    $w('#highestCollegeDegree').onChange(() => change('highestCollegeDegree'))
    $w('#wildCardA').onChange(() => change('wildCardA'))
    $w('#wildCardB').onChange(() => change('wildCardB'))
    $w('#tc').onChange(() => change('tc'))

    $w('#discard').onClick(() => getProfile())
    $w('#updateInfo').onClick(() => check())

}

// ========================================= DROP STATES =========================================
async function drop() {
    await wixData.query("States").ascending('state').find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].state, value: results.items[i]._id })
            }
            $w('#state').options = array;
        }).catch((err) => console.log(err))

    let date = new Date()
    let minYear = date.getFullYear()
    let maxYear = date.getFullYear() + 4
    let arrayYears = []
    for (let i = minYear; i <= maxYear; i++) {
        arrayYears.push({ label: i + "", value: i + "" })
    }
    $w('#hsGraduationYear').options = arrayYears;
}

// ========================================= GET PROFILE =========================================
function getProfile() {
    $w('#discard').disable();
    $w('#updateInfo').disable();
    currentMember.getMember()
        .then(async (member) => {
            await wixData.query("users").eq('privateId', member._id).find()
                .then(async (results) => {
                    if (results.items.length > 0) {
                        //console.log(results.items[0])
                        json = results.items[0]
                        let role = json.role
                        $w('#role').text = role
                        $w('#firstName').value = json.firstName
                        $w('#lastName').value = json.lastName
                        $w('#messageEmail').html = '<p style="font-size:17px;">Login Email:</p><p style="font-size:17px;">' + json.email + '</p><p style="font-size:17px;"><span class="color_18">Your Login email can&#39;t be changed</span></p>'
                        $w('#email').value = json.email
                        $w('#picture').src = json.picture
                        $w('#picture').tooltip = json.firstName + " " + json.lastName
                        $w('#picture').alt = json.firstName + " " + json.lastName

                        if (!(json.completeProfile)) $w('#updateInfo').label = "Complete Profile"

                        if (role == "High School Student") {
                            $w('#highestCollegeDegree').collapse();
                            $w('#university').collapse();

                            if (json.premium) {
                                $w('#premiumTxT').collapse();
                                $w('#hsGraduationYear').enable();
                                $w('#hsName').enable();
                                $w('#state').enable();
                                $w('#city').enable();

                                $w('#myStory').enable();
                                $w('#college').enable();
                                $w('#major').enable();

                                $w('#wildCardA').enable();
                                $w('#wildCardB').enable();
                            }

                            $w('#college').label = "College you wish to attend";
                            if (json.hsName) $w('#hsName').value = json.hsName
                            if (json.hsGraduationYear) $w('#hsGraduationYear').value = json.hsGraduationYear + ""
                            if (json.city) $w('#city').value = json.city
                            if (json.state) $w('#state').value = json.state, stateValue()
                            if (json.myStory) $w('#myStory').value = json.myStory
                            if (json.collegeYouWishToAttend) $w('#college').value = json.collegeYouWishToAttend
                            $w('#tc').checked = json.tc
                            $w('#tc').disable();

                        } else if (role == "Parents") {
                            $w('#hsName').collapse();
                            $w('#hsGraduationYear').collapse();
                            $w('#university').collapse();
                            $w('#major').collapse();
                            $w('#college').collapse();
                            $w('#highestCollegeDegree').collapse();
                            $w('#wildCardA').collapse();
                            $w('#wildCardB').collapse();

                            if (json.premium) {
                                $w('#premiumTxT').collapse();
                                $w('#tc').enable();
                                $w('#state').enable();
                                $w('#city').enable();

                                $w('#myStory').enable();

                                $w('#wildCardA').enable();
                                $w('#wildCardB').enable();
                            }

                            if (json.city) $w('#city').value = json.city
                            if (json.state) $w('#state').value = json.state, stateValue()
                            if (json.myStory) $w('#myStory').value = json.myStory
                            if (json.wildCardA) $w('#wildCardA').checked = json.wildCardA
                            if (json.wildCardB) $w('#wildCardB').checked = json.wildCardB
                            if (json.tc) $w('#tc').checked = json.tc, $w('#tc').disable();

                        } else if (role == "College Student" || json.role == "College Graduate" || json.role == "Counselor") {

                            $w('#hsName').collapse();
                            $w('#hsGraduationYear').collapse();
                            $w('#college').collapse();
                            $w('#wildCardA').collapse();
                            $w('#wildCardB').collapse();

                            if (role == "College Student") $w('#highestCollegeDegree').collapse();

                            if (json.premium) {
                                $w('#premiumTxT').collapse();
                                $w('#state').enable();
                                $w('#city').enable();

                                $w('#myStory').enable();
                                $w('#university').enable();
                                $w('#highestCollegeDegree').enable();
                                $w('#major').enable();

                                $w('#tc').enable();
                            }

                            if (json.city) $w('#city').value = json.city
                            if (json.state) $w('#state').value = json.state, stateValue()
                            if (json.myStory) $w('#myStory').value = json.myStory
                            if (json.university) $w('#university').value = json.university
                            if (json.major) $w('#major').value = json.major
                            if (json.highestCollegeDegree) $w('#highestCollegeDegree').value = json.highestCollegeDegree
                            if (json.tc) $w('#tc').checked = json.tc, $w('#tc').disable();

                            if (json.myStory) $w('#myStory').value = json.myStory, $w('#myStory').expand();
                        } else if (role == "Sponsor") {
                            $w('#tc').checked = json.tc;
                            $w('#discard').hide();
                            $w('#updateInfo').hide();
                            $w('#premiumTxT').collapse();
                            $w('#hsName').collapse();
                            $w('#hsGraduationYear').collapse();
                            $w('#city').collapse();
                            $w('#state').collapse();
                            $w('#myStory').collapse();
                            $w('#university').collapse();
                            $w('#major').collapse();
                            $w('#college').collapse();
                            $w('#highestCollegeDegree').collapse();
                            $w('#wildCardA').collapse();
                            $w('#wildCardB').collapse();
                        }

                        $w('#loading').hide();
                        $w('#box').show();
                    }
                }).catch((err) => console.log(err));
        }).catch((error) => console.error(error));
}

// ========================================= CHANGE =========================================
function change(field) {
    let value = false
    if (field == 'hsName') {
        json2.hsName = $w('#hsName').value
        if (json.hsName !== json2.hsName) value = true
    }

    if (field == 'hsGraduationYear') {
        json2.hsGraduationYear = parseInt($w('#hsGraduationYear').value)
        if (json.hsGraduationYear !== json2.hsGraduationYear) value = true
    }

    if (field == 'city') {
        json2.city = $w('#city').value
        if (json.city !== json2.city) value = true
    }

    if (field == 'state') {
        json2.state = $w('#state').value
        if (json.state !== json2.state) value = true
    }

    if (field == 'myStory') {
        json2.myStory = $w('#myStory').value
        if (json.myStory !== json2.myStory) value = true
    }

    if (field == 'university') {
        json2.university = $w('#university').value
        if (json.university !== json2.university) value = true
    }

    if (field == 'major') {
        json2.major = $w('#major').value
        if (json.major !== json2.major) value = true
    }

    if (field == 'college') {
        json2.college = $w('#college').value
        if (json.college !== json2.college) value = true
    }

    if (field == 'highestCollegeDegree') {
        json2.highestCollegeDegree = $w('#highestCollegeDegree').value
        if (json.highestCollegeDegree !== json2.highestCollegeDegree) value = true
    }

    if (field == 'wildCardA') {
        json2.wildCardA = $w('#wildCardA').checked
        if (json.wildCardA !== json2.wildCardA) value = true
    }

    if (field == 'wildCardB') {
        json2.wildCardB = $w('#wildCardB').checked
        if (json.wildCardB !== json2.wildCardB) value = true
    }

    if (field == 'tc') {
        json2.tc = $w('#tc').checked
        if (json.tc !== json2.tc) value = true
    }

    if (value) $w('#discard').enable(), $w('#updateInfo').enable()
    else $w('#discard').disable(), $w('#updateInfo').disable()
}

function stateValue() {
    wixData.query('States').eq('_id', $w('#state').value).find().then((result) => {
        stateV = result.items[0].state
    }).catch((err) => console.log(err))
}

// ========================================= SAVE ========================================= 
function check() {
    $w('#message').collapse();
    $w('#updateInfo').disable()
    try {

        checkValidation();
        updateUser();

    } catch (err) {
        $w('#message').text = err.message;
        $w('#message').expand();
        $w('#updateInfo').enable();
    }
}

function checkValidation() {
    if (!$w('#city').valid) throw new Error('Missing City');
    if (!$w('#state').valid) throw new Error('Missing HS State');
    if (!$w('#myStory').valid) throw new Error('Missing HS My Story');
    // Roles
    if (json.role == "High School Student") {
        if (!$w('#hsName').valid) throw new Error('Missing HS Name');
        if (!$w('#hsGraduationYear').valid) throw new Error('Missing HS Graduation Year');
    } else if (json.role == "Parents") {
        if (!$w('#tc').valid) throw new Error('Missing Terms And Conditions');
    } else if (json.role == "College Student" || json.role == "College Graduate" || json.role == "Counselor") {
        if (!$w('#university').valid) throw new Error('Missing university');
        if (!$w('#major').valid) throw new Error('Missing major');
        if(json.role !== "College Student") if (!$w('#highestCollegeDegree').valid) throw new Error('Missing Highest College Degree');
        if (!$w('#tc').valid) throw new Error('Missing Terms And Conditions');
    }
}

// ========================================= UPDATE =========================================
function updateUser() {

    json.city = $w('#city').value
    json.state = $w('#state').value
    json.stateV = stateV
    json.myStory = $w('#myStory').value
    json.tc = $w('#tc').checked
    if (!(json.completeProfile)) json.completeProfile = true

    if (json.role == "High School Student") {
        json.hsName = $w('#hsName').value
        json.hsGraduationYear = parseInt($w('#hsGraduationYear').value)
        json.collegeYouWishToAttend = $w('#college').value
        json.wildCardA = $w('#wildCardA').checked
        json.wildCardB = $w('#wildCardB').checked
        json.tc = $w('#tc').checked
    } else if (json.role == "Parents") {
        json.wildCardA = $w('#wildCardA').checked
        json.wildCardB = $w('#wildCardB').checked
    } else if (json.role == "College Student" || json.role == "College Graduate" || json.role == "Counselor") {
        json.university = $w('#university').value
        json.major = $w('#major').value
        if (json.roles !== "College Student") json.highestCollegeDegree = $w('#highestCollegeDegree').value
    }

    wixData.update("users", json).then((results) => {
        if (!(json.completeProfile)) $w('#updateInfo').label = "Update Info"
        $w('#box').hide();
        $w('#loading').show();
        setTimeout(() => getProfile(), 2000);
    })

}