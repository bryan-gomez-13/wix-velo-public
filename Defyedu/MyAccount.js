import wixData from 'wix-data';
import { currentMember } from 'wix-members';
var json
var json2 = {
    hsName: "",
    hsGraduationYear: 0,
    city: "",
    state: "",
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
    $w('#state').onChange(() => change('state'))
    $w('#myStory').onInput(() => change('myStory'))
    $w('#university').onInput(() => change('university'))
    $w('#major').onInput(() => change('major'))
    $w('#college').onInput(() => change('college'))
    $w('#highestCollegeDegree').onChange(() => change('highestCollegeDegree'))

    $w('#discard').onClick(() => getProfile())
    $w('#updateInfo').onClick(() => updateUser())

}

// ========================================= UPDATE =========================================
function updateUser() {

    json.hsName = $w('#hsName').value
    json.hsGraduationYear = parseInt($w('#hsGraduationYear').value)
    json.city = $w('#city').value
    json.state = $w('#state').value
    json.myStory = $w('#myStory').value
    json.university = $w('#university').value
    json.major = $w('#major').value
    json.collegeYouWishToAttend = $w('#college').value
    json.highestCollegeDegree = $w('#highestCollegeDegree').value

    wixData.update("users", json)
        .then((results) => {
            $w('#box').hide();
            $w('#loading').show();
            setTimeout(() => getProfile(), 2000);
        })
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

    let minYear = 1950
    let date = new Date()
    let maxYear = date.getFullYear()
    let arrayYears = []
    for (let i = maxYear; i > minYear; i--) {
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

                        if (json.completeProfile) $w('#discard').show(), $w('#updateInfo').show();

                        if (role == "High School Student") {
                            if (json.hsName) $w('#hsName').value = json.hsName, $w('#hsName').expand();
                            if (json.hsGraduationYear) $w('#hsGraduationYear').value = json.hsGraduationYear + "", $w('#hsGraduationYear').expand();
                            if (json.city) $w('#city').value = json.city, $w('#city').expand();
                            if (json.state) $w('#state').value = json.state, $w('#state').expand();
                            if (json.myStory) $w('#myStory').value = json.myStory, $w('#myStory').expand();
                            $w('#college').label = "College you wish to attend";
                            $w('#college').expand();
                            /*if (json.collegeYouWishToAttend)*/
                            $w('#college').value = json.collegeYouWishToAttend
                            $w('#major').label = "Desired Major"
                            $w('#major').expand();
                            /*if (json.major)*/
                            $w('#major').value = json.major

                        } else if (role == "Parents") {
                            $w('#city').value = json.city;
                            $w('#city').expand();
                            $w('#state').value = json.state;
                            $w('#state').expand();

                            if (json.myStory) $w('#myStory').value = json.myStory, $w('#myStory').expand();

                        } else if (role == "College Student" || json.role == "College Graduate" || json.role == "Counselor") {
                            $w('#city').value = json.city;
                            $w('#city').expand();
                            $w('#state').value = json.state;
                            $w('#state').expand();
                            $w('#university').value = json.university;
                            $w('#university').expand();
                            $w('#major').value = json.major;
                            $w('#major').expand();
                            $w('#highestCollegeDegree').value = json.highestCollegeDegree;
                            $w('#highestCollegeDegree').expand();

                            if (json.myStory) $w('#myStory').value = json.myStory, $w('#myStory').expand();
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

    if (value) $w('#discard').enable(), $w('#updateInfo').enable()
    else $w('#discard').disable(), $w('#updateInfo').disable()
}