import { currentMember } from 'wix-members';
import wixLocation from 'wix-location';
import { getDropsBack, getMemberBack, saveLearnerBack, getLearnersBack, deleteLearnerBack, updateParentBack, updateTeacherBack } from 'backend/Collections.jsw'

var privateId, jsonRole, image, teacherVSRC, teacherDegrees = { arrayDoc: [], arrayRep: [] }

$w.onReady(async function () {
    init();
    timezone();
    await initialFunctions();
});

function init() {
    // ========================================== PARENT AREA ==========================================
    // ===================== LOCATION =====================
    $w('#parentLocation').onChange(() => {
        if ($w('#parentLocation').value.city) $w('#parentCity').value = $w('#parentLocation').value.city
        if ($w('#parentLocation').value.postalCode) $w('#parentPostalCode').value = $w('#parentLocation').value.postalCode
        if ($w('#parentLocation').value.country) $w('#parentCountry').value = $w('#parentLocation').value.country
    })
    // ===================== VIEW PASSWORD =====================
    $w('#parentViewPassBT').onClick(() => {
        $w('#parentViewPassBT').disable();
        $w('#parentPassArea').inputType = "text"
        setTimeout(() => { $w('#parentPassArea').inputType = "password", $w('#parentViewPassBT').enable() }, 2000);
    })
    // ===================== CHANGE =====================
    $w('#parentTimeZone').onChange(() => change('parentTimeZone'));
    $w('#parentCity').onChange(() => change('parentCity'));
    $w('#parentAboutMe').onInput(() => change('parentAboutMe'));
    $w('#parentPassArea').onInput(() => change('parentPassArea'));
    // ===================== DISCARD AND UPDATE =====================
    $w('#discard').onClick(() => { getCurrentMember(), $w('#discard').disable() })
    $w('#updateInfo').onClick(() => update())
    // ===================== PHOTO =====================
    $w('#profilePhoto').onChange(() => uploadPicture())
    // ===================== SAVE LEARNER =====================
    $w('#repLearner').onItemReady(($item, itemData, index) => {
        // ===================== SAVE LEARNER =====================
        $item('#parentSave').onClick(async (event) => {
            $item('#parentMessage').collapse();
            $item('#parentSave').disable();
            try {
                checkValidation($item('#parentName').valid, $item('#parentAge').valid, $item('#parentDateBirth').valid);
                $item('#loadingLearner').expand();
                let json = {
                    privateId: privateId,
                    name: $item('#parentName').value,
                    age: $item('#parentAge').value,
                    teachersKnow: $item('#parentTeacherKnow').value,
                    areasOfInterest: $item('#parentAreaInterest').value,
                    preferredTimes: $item('#parentPreferredTimes').value,
                    birth: $item('#parentDateBirth').value,
                }
                if (itemData._id !== "0") json._id = itemData._id
                await saveLearnerBack(json);
                $item('#loadingLearner').collapse();
                await getLearners();
            } catch (err) {
                $item('#loadingLearner').collapse();
                $item('#parentMessage').text = err.message;
                $item('#parentMessage').expand();
                $item('#parentSave').enable();
            }
        })
        // ===================== DELETE LEARNER =====================
        $item('#parentDelete').onClick(async () => {
            if (itemData._id == '0') {
                let newJson = $w('#repLearner').data
                newJson.pop()
                $w('#repLearner').data = newJson
            } else {
                await deleteLearnerBack(itemData._id);
                await getLearners();
            }
        })
        /*
        // ===================== UPDATE VALIDATION LEARNER =====================
        $item('#parentName').onInput(() => {
            if (itemData._id !== '0') {
                if ($item('#parentName').value !== $w('#repLearner').data[index].name) {
                    if (!($item('#parentSave').enabled)) $item('#parentSave').enable();
                } else {
                    if (!($item('#parentSave').enabled)) $item('#parentSave').disable();
                }
            }
        })
        */
    })

    // ===================== ADD LEARNER =====================
    $w('#parentAddLeaner').onClick(() => {
        let newJson = $w('#repLearner').data
        newJson.push({ _id: "0", name: "", age: "", teachersKnow: "", areasOfInterest: [], preferredTimes: "", birth: null, })
        $w('#repLearner').data = newJson
    })
    // ========================================== TEACHER AREA ==========================================
    $w('#teacherVideo').onChange(() => uploadTeacherVideo())
    $w('#teacherDegrees').onChange(() => uploadDegrees())
    // ===================== CHANGE =====================
    $w('#teacherHeadline').onInput(() => change('teacherHeadline'));
    $w('#teacherCountry').onInput(() => change('teacherCountry'));
    $w('#teacherAboutMe').onInput(() => change('teacherAboutMe'));
    $w('#teacherVideo').onChange(() => change('teacherVideo'));
    $w('#teacherDegrees').onChange(() => change('teacherDegrees'));
    $w('#teacherPhone').onInput(() => change('teacherPhone'));
    $w('#teacherEmailPaypal').onInput(() => change('teacherEmailPaypal'));
    // ===================== DISCARD AND UPDATE =====================
    $w('#discardT').onClick(() => { getCurrentMember(), $w('#discardT').disable() })
    $w('#updateInfoT').onClick(() => updateT())
}

// ==================================================================================== INITIAL FUNCTIONS ====================================================================================
async function initialFunctions() {
    await getCurrentMember();
    if (jsonRole.role == "Parent") {
        await getDropdowns();
        await getLearners();
    }
}

async function getDropdowns() {
    let array = await getDropsBack();
    $w('#parentTimeZone').options = array.timezone;
    $w('#parentAreaInterest').options = array.areaInterest;
}

async function getCurrentMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options).then(async (member) => {
            privateId = member._id
            let json = await getMemberBack(privateId)
            console.log(json)
            jsonRole = json

            // Both
            $w('#role').text = json.role
            $w('#firstName').value = json.name
            $w('#surname').value = json.surname
            $w('#messageEmail').html = '<p class="p1" style="font-size:17px; line-height:normal;"><span style="font-size:17px;"><span style="font-family:wfont_aa8909_9562a707b1194762960b0213d9c31621,wf_9562a707b1194762960b0213d,orig_orkneyregular;"><span style="font-weight:normal;"><span style="font-style:normal;"><span style="color:rgb(35, 35, 35);"><span style="letter-spacing:0em;">Login Email:</span></span></span></span></span></span></p><p class="p1" style="font-size:17px; line-height:normal;"><span style="font-size:17px;"><span style="font-family:wfont_aa8909_9562a707b1194762960b0213d9c31621,wf_9562a707b1194762960b0213d,orig_orkneyregular;"><span style="font-weight:normal;"><span style="font-style:normal;"><span style="color:rgb(35, 35, 35);"><span style="letter-spacing:0em;">' + json.email + '</span></span></span></span></span></span></p><p class="p1" style="font-size:17px; line-height:normal;"><span style="font-weight:bold;"><span class="color_28"><span style="font-size:17px;"><span style="font-family:wfont_aa8909_9562a707b1194762960b0213d9c31621,wf_9562a707b1194762960b0213d,orig_orkneyregular;"><span style="font-style:normal;"><span style="letter-spacing:0em;">Your Login email can&#39;t be changed</span></span></span></span></span></span></p>'
            $w('#email').value = json.email
            if (json.image) $w('#photo').src = json.image

            if (json.role == "Parent") {
                if (!(json.noExist)) {
                    image = json.image
                    $w('#parentTimeZone').value = json.timeZone
                    $w('#parentLocation').value = json.address
                    $w('#parentCity').value = json.address.city
                    $w('#parentPostalCode').value = json.address.postalCode
                    $w('#parentCountry').value = json.address.country
                    $w('#parentAboutMe').value = json.aboutMe
                    $w('#parentPassArea').value = json.passParentArea
                } else image = "wix:image://v1/07d5d3_05fc3722e43142ceade47a9decc0c45e~mv2.png/_.png#originWidth=3439&originHeight=1690"
            } else {
                $w('#teacherEmailPP').value = json.email
                if (!(json.noExist)) {
                    image = json.photo
                    //json.video = item.video
                    if (json.video) {
                        teacherVSRC = json.video
                        $w('#teacherVideoBT').src = json.video;
                        $w('#teacherVideoBT').expand();
                    }
                    if (json.degreesAndCertificates) {
                        teacherDegrees.arrayDoc = json.degreesAndCertificates;
                        teacherDegrees.arrayRep = json.degreesRep;
                        await updateTeacherDegrees()
                    }
                    $w('#teacherHeadline').value = json.headline
                    $w('#teacherCountry').value = json.country
                    $w('#teacherAboutMe').value = json.aboutMe
                    $w('#teacherPhone').value = json.phone
                    $w('#teacherEmailPaypal').value = json.paypalEmail
                } else image = "wix:image://v1/07d5d3_05fc3722e43142ceade47a9decc0c45e~mv2.png/_.png#originWidth=3439&originHeight=1690"
            }

            if (json.role == "Parent") $w('#box').changeState('Parent')
            else if (json.role == "Teacher") $w('#box').changeState('Teacher')
        })
        .catch((error) => console.error(error));
}

async function getLearners() {
    $w('#repLearner').collapse();
    $w('#loadingParent').expand();

    let array = await getLearnersBack(privateId);
    $w('#repLearner').data = array
    $w('#repLearner').onItemReady(($item, itemData, index) => {

        if (itemData._id == "0") $item('#parentSave').label = "Save" //, $item('#parentSave').enable();
        else $item('#parentSave').label = "Update" //, $item('#parentSave').disable();

        $item('#parentLeanerNumber').text = "Learner " + (parseInt(index) + 1)
        $item('#parentName').value = itemData.name
        $item('#parentAge').value = itemData.age
        $item('#parentTeacherKnow').value = itemData.teachersKnow
        $item('#parentAreaInterest').value = itemData.areasOfInterest
        $item('#parentPreferredTimes').value = itemData.preferredTimes
        $item('#parentDateBirth').value = itemData.birth
    })

    $w('#loadingParent').collapse();
    $w('#repLearner').expand();
}

function timezone() {
    let date = new Date()
    let timeZ = date.getTimezoneOffset()
    const hours = Math.abs(Math.floor(timeZ / 60));
    const minutes = Math.abs(timeZ % 60);
    const sign = timeZ > 0 ? '-' : '+';
    const timezone = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log(timezone)
}
// ==================================================================================== PARENTS ====================================================================================
function checkValidation(name, age, birth) {
    if (!name) throw new Error('Missing Name');
    if (!age) throw new Error('Missing Age');
    if (!birth) throw new Error('Missing Date of Birth');
}

function update() {
    $w('#parentMessageUpdate').collapse();
    $w('#updateInfo').disable()
    try {

        checkValidationUpdate();
        $w('#loadingParentComplete').expand();
        updateParent();

    } catch (err) {
        $w('#parentMessageUpdate').text = err.message;
        $w('#parentMessageUpdate').expand();
        $w('#updateInfo').enable();
    }
}

function checkValidationUpdate() {
    if (!(image !== "wix:image://v1/07d5d3_05fc3722e43142ceade47a9decc0c45e~mv2.png/_.png#originWidth=3439&originHeight=1690")) throw new Error('Missing Photo');
    if (!$w('#parentTimeZone').valid) throw new Error('Missing TimeZone');
    if (!$w('#parentCity').valid) throw new Error('Missing Select Location');
    if (!($w('#parentPassArea').value.length == 4)) throw new Error('Missing Password needs 4 characters');
    if (!$w('#parentPassArea').valid) throw new Error('Missing Password for parent area');
}

async function updateParent() {
    let json = {
        privateId: privateId,
        timeZone: $w('#parentTimeZone').value,
        location: $w('#parentLocation').value.formatted,
        city: $w('#parentCity').value,
        postalCode: $w('#parentPostalCode').value,
        country: $w('#parentCountry').value,
        aboutMe: $w('#parentAboutMe').value,
        passParentArea: $w('#parentPassArea').value,
    }
    if (image) json.image = image
    if (jsonRole._id) json._id = jsonRole._id
    await updateParentBack(json)
    $w('#loadingParentComplete').collapse();
    await getCurrentMember();
    $w('#updateInfo').enable();
}

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
                    image = uploadedFile.fileUrl;
                    //imageId = "https://static.wixstatic.com/media/" + uploadedFile.fileName

                    $w("#parentMessageUpdate").collapse();
                })
            })
            .catch((uploadError) => {
                $w("#parentMessageUpdate").text = "Error: " + uploadError.errorDescription;
                $w("#parentMessageUpdate").expand();
            });
    } else { // user clicked button but didn't chose a file
        $w('#photo').src = "https://static.wixstatic.com/media/07d5d3_e7ff36b7536d4c278d53894ad5c7e6da~mv2.jpg"
        $w('#profilePhoto').label = "Upload new photo"
        $w("#parentMessageUpdate").text = "Please choose a file to upload.";
        $w("#parentMessageUpdate").expand();
    }
    change('profilePhoto')
}

// ==================================================================================== TEACHER ====================================================================================
async function uploadTeacherVideo(params) {
    if ($w("#teacherVideo").value.length > 0) { // user chose a file
        await $w("#teacherVideo").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    //console.log(uploadedFile)
                    //console.log(uploadedFile.fileUrl)
                    $w("#teacherVideoBT").src = uploadedFile.fileUrl
                    $w('#teacherVideoBT').expand();
                    //$w("#image").expand();
                    teacherVSRC = uploadedFile.fileUrl;
                    $w("#teacherMsgVideo").collapse();
                })
            })
            .catch((uploadError) => {
                $w("#teacherMsgVideo").text = "Error: " + uploadError.errorDescription;
                $w("#teacherMsgVideo").expand();
                $w('#teacherVideoBT').collapse();
            });
    }
}

async function uploadDegrees() {
    if ($w("#teacherDegrees").value.length > 0) { // user chose a file
        await $w("#teacherDegrees").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(async uploadedFile => {
                    let min = 1000000000; // Valor mínimo de 10 dígitos
                    let max = 9999999999; // Valor máximo de 10 dígitos
                    let nId = Math.floor(Math.random() * (max - min + 1) + min);
                    let json = {
                        "_id": teacherDegrees.arrayRep.length + nId + "",
                        "name": uploadedFile.originalFileName,
                        "link": uploadedFile.fileUrl
                    }
                    teacherDegrees.arrayRep.push(json);
                    teacherDegrees.arrayDoc.push(uploadedFile.fileUrl);
                    await updateTeacherDegrees()
                })
            })
            .catch((uploadError) => {
                $w("#teacherMsgDegrees").text = "Error: " + uploadError.errorDescription;
                $w("#teacherMsgDegrees").expand();
                $w('#teacherVideoBT').collapse();
            });
    }
}

async function updateTeacherDegrees() {
    $w('#teacherRepeaterDocument').data = teacherDegrees.arrayRep
    $w('#teacherRepeaterDocument').expand();
    $w('#teacherRepeaterDocument').onItemReady(($item, itemData) => {
        $item('#teacherPDF').text = itemData.name;
        $item('#teacherPDF').onClick(() => wixLocation.to(itemData.link));
        $item('#teacherDeletePDF').onClick(() => deleteTeacherPDF(itemData))
    })
}

function deleteTeacherPDF(itemData) {
    $w('#teacherRepeaterDocument').collapse();
    for (let i = 0; i < teacherDegrees.arrayRep.length; i++) {
        if (teacherDegrees.arrayRep[i].name == itemData.name) {
            teacherDegrees.arrayDoc.splice(i, 1)
            teacherDegrees.arrayRep.splice(i, 1)
            break
        }
    }
    updateTeacherDegrees()
    change('teacherDegrees')
}

function updateT() {
    $w('#teacherMessageUpdate').collapse();
    $w('#updateInfoT').disable()
    try {

        checkValidationUpdateT();
        $w('#loadingTeacherComplete').expand();
        updateParentT();

    } catch (err) {
        $w('#teacherMessageUpdate').text = err.message;
        $w('#teacherMessageUpdate').expand();
        $w('#updateInfoT').enable();
    }
}

function checkValidationUpdateT() {
    if (!(image !== "wix:image://v1/07d5d3_05fc3722e43142ceade47a9decc0c45e~mv2.png/_.png#originWidth=3439&originHeight=1690")) throw new Error('Missing Photo');
    if (!$w('#teacherHeadline').valid) throw new Error('Missing Headline');
    if (!$w('#teacherCountry').valid) throw new Error('Missing Country');
    if (!teacherVSRC) throw new Error('Missing Video');
    if (!(teacherDegrees.arrayDoc.length > 0)) throw new Error('Missing Degrees');
    if (!$w('#teacherEmailPaypal').valid) throw new Error('Missing Email Paypal');
}

async function updateParentT() {
    let json = {
        privateId: privateId,
        headline: $w('#teacherHeadline').value,
        country: $w('#teacherCountry').value,
        aboutMe: $w('#teacherAboutMe').value,
        video: teacherVSRC,
        degreesAndCertificates: teacherDegrees.arrayDoc,
        arrayDegrees: teacherDegrees.arrayRep,
        phone: $w('#teacherPhone').value,
        paypalEmail: $w('#teacherEmailPaypal').value,
        primaryEmail: $w('#teacherEmailPP').value,
    }

    if (image && jsonRole.role == "Parent") json.image = $w('#photo').src
    else json.photo = $w('#photo').src
    if (jsonRole._id) json._id = jsonRole._id

    await updateTeacherBack(json)
    $w('#loadingTeacherComplete').collapse();
    await getCurrentMember();
    $w('#updateInfoT').enable();
}

// ==================================================================================== CHANGE ====================================================================================
function change(field) {
    if (!(jsonRole.noExist)) {
        //===================== Parent =====================
        let value = false
        if (field == 'parentTimeZone') {
            let changeV = $w('#parentTimeZone').value
            if (changeV !== jsonRole.timeZone) value = true
        }

        if (field == 'parentCity') {
            let changeV = $w('#parentCity').value
            if (changeV !== jsonRole.city) value = true
        }

        if (field == 'parentAboutMe') {
            let changeV = $w('#parentAboutMe').value
            if (changeV !== jsonRole.aboutMe) value = true
        }

        if (field == 'parentPassArea') {
            let changeV = $w('#parentPassArea').value
            if (changeV !== jsonRole.passParentArea) value = true
        }

        if (field == 'profilePhoto') {
            let changeV = image
            console.log(image)
            console.log(jsonRole.image)
            if (changeV !== jsonRole.image) value = true
        }

        //===================== Teacher =====================
        if (field == 'teacherHeadline') {
            let changeV = $w('#teacherHeadline').value
            if (changeV !== jsonRole.headline) value = true
        }

        if (field == 'teacherCountry') {
            let changeV = $w('#teacherCountry').value
            if (changeV !== jsonRole.country) value = true
        }

        if (field == 'teacherAboutMe') {
            let changeV = $w('#teacherAboutMe').value
            if (changeV !== jsonRole.aboutMe) value = true
        }

        if (field == 'teacherVideo') {
            let changeV = teacherVSRC
            if (changeV !== jsonRole.video) value = true
        }
        //Degrees
        if (field == 'teacherDegrees') {
            let changeV = teacherDegrees.arrayDoc
            if (changeV !== jsonRole.degreesRep) value = true
        }

        if (field == 'teacherPhone') {
            let changeV = $w('#teacherPhone').value
            if (changeV !== jsonRole.phone) value = true
        }

        if (field == 'teacherEmailPaypal') {
            let changeV = $w('#teacherEmailPaypal').value
            if (changeV !== jsonRole.paypalEmail) value = true
        }

        if (jsonRole.role == "Parent") {
            if (value) $w('#discard').enable(), $w('#updateInfo').enable()
            else $w('#discard').disable(), $w('#updateInfo').disable()
        } else {
            if (value) $w('#discardT').enable(), $w('#updateInfoT').enable()
            else $w('#discardT').disable(), $w('#updateInfoT').disable()
        }
    }

}