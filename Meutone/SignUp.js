import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { signUp } from 'backend/signUp.jsw'

var Image, imageId
$w.onReady(function () {
    init()
    drop()
});

function init() {
    //BOX
    $w('#type').onChange(() => {
        if ($w('#type').value == 'Artist') $w('#box').changeState('Artist')
        else $w('#box').changeState('Visitors')
    })
    //Photo
    $w('#profilePhoto').onChange(() => uploadPicture())

    //send Info
    $w('#sendA').onClick(() => checkA())
    $w('#sendV').onClick(() => checkV())

    //search email
    $w('#emailA').onInput(() => getEmail($w('#emailA').value, "Artist"))
    $w('#emailV').onInput(() => getEmail($w('#emailV').value, "Users"))
}

async function drop() {
    await wixData.query("TypeArtist").ascending('title').find().then((results) => {
            let array = []
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i]._id })
            }
            $w('#typeOfArtist').options = array;
    }).catch((err) => console.log(err));

    await wixData.query("Genres").ascending('title').find().then((results) => {
        let array = []
        for (let i = 0; i < results.items.length; i++) {
            array.push({ label: results.items[i].title, value: results.items[i]._id })
        }
        $w('#artistGenre').options = array;
    }).catch((err) => console.log(err));
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

                    $w("#textUpload").collapse();
                })
            })
            .catch((uploadError) => {
                $w("#textUpload").text = "Error: " + uploadError.errorDescription;
                $w("#textUpload").expand();
            });
    } else { // user clicked button but didn't chose a file
        $w("#textUpload").text = "Please choose a file to upload.";
        $w("#textUpload").expand();
    }
}

async function getEmail(email, collection) {
    $w('#messageA').collapse()
    $w('#messageV').collapse()
    await wixData.query(collection)
        .eq('email', email)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                if ($w('#type').value == "Artist") {
                    $w('#messageA').text = "This email alredy exist."
                    $w('#messageA').expand()
                    $w('#messageA').scrollTo()
                    $w('#sendA').disable()
                } else {
                    $w('#messageV').text = "This email alredy exist."
                    $w('#messageV').expand()
                    $w('#messageV').scrollTo()
                    $w('#sendV').disable()
                }
            } else {
                $w('#sendA').enable()
                $w('#sendV').enable()
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

// ========================================= ARTIST =========================================
function checkA() {
    $w('#messageA').collapse();
    $w('#sendA').disable()
    try {

        checkValidationA();
        saveA();

    } catch (err) {
        $w('#messageA').text = err.message;
        $w('#messageA').expand();
        $w('#sendA').enable();
    }
}

function checkValidationA() {
    if (!($w("#profilePhoto").value.length > 0)) throw new Error('Missing Profile Photo');
    if (!$w('#artistBandName').valid) throw new Error('Missing Artist/Band Name');
    if (!$w('#emailA').valid) throw new Error('Missing Email');
    if (!$w('#passA').valid) throw new Error('Missing password');
    if ($w('#passA').value.length < 6) throw new Error('Password should contain at least 6 characters');
    if (!$w('#typeOfArtist').valid) throw new Error('Missing Type of Artist');
    if (!$w('#artistGenre').valid) throw new Error('Missing Artist Genre');
    if (!$w('#briefBio').valid) throw new Error('Missing Brief Bio');
    if (!($w("#artistPhotosCoverArt").value.length > 0)) throw new Error('Missing Artist Photos/ Cover Art');

    if ($w('#youtube').value.length > 0)
        if (!$w('#youtube').valid) throw new Error('Missing youtube or http://');
    if ($w('#facebook').value.length > 0)
        if (!$w('#facebook').valid) throw new Error('Missing facebook or http://');
    if ($w('#instagram').value.length > 0)
        if (!$w('#instagram').valid) throw new Error('Missing instagram or http://');
    if ($w('#twitter').value.length > 0)
        if (!$w('#twitter').valid) throw new Error('Missing twitter or http://');
    if ($w('#bandcamp').value.length > 0)
        if (!$w('#bandcamp').valid) throw new Error('Missing bandcamp or http://');
    if ($w('#artistsMusicLinks').value.length > 0)
        if (!$w('#artistsMusicLinks').valid) throw new Error('Missing Artist Music Links or http://');
}

async function saveA() {
    //upload Photos
    let photos = await uploadhotos();

    let json = {
        type: $w('#type').value,
        privateId: "id",
        profilePhoto: Image,
        artistBandName: $w('#artistBandName').value,
        email: $w('#emailA').value,
        typeOfArtist: $w('#typeOfArtist').value,
        artistGenre: $w('#artistGenre').value,
        briefBio: $w('#briefBio').value,
        artistPhotosCoverArt: photos,
        youtube: $w('#youtube').value,
        facebook: $w('#facebook').value,
        instagram: $w('#instagram').value,
        twitter: $w('#twitter').value,
        bandcamp: $w('#bandcamp').value,
        artistsMusicLinks: $w('#artistsMusicLinks').value
    }
    //console.log(0, json)

    await signUp(json, $w('#passA').value, imageId).then(async (result) => {
        if (result.type === 'success') {
            json.privateId = result.id
            await wixData.insert("Artist", json)
            await wixUsers.applySessionToken(result.sessionToken)
            $w('#messageA').text = result.message;
            $w('#messageA').expand();
            setTimeout(() => wixLocation.to('/'), 1000);
        } else {
            console.error(`${result.type} error occurred. Error message: ${result.message}`);
            $w('#messageA').text = `${result.type} error occurred.`;
            $w('#messageA').expand();
        }
    })
}

async function uploadhotos() {
    let array = []
    if ($w("#artistPhotosCoverArt").value.length > 0) { // user chose a file
        await $w("#artistPhotosCoverArt").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    array.push({
                        alt: uploadedFile.originalFileName,
                        src: uploadedFile.fileUrl,
                        title: uploadedFile.originalFileName,
                        type: "image"
                    })
                    $w("#messageA").collapse();
                })
            })
            .catch((uploadError) => {
                $w("#messageA").text = "Error: " + uploadError.errorDescription;
                $w("#messageA").expand();
            });
    } else { // user clicked button but didn't chose a file
        $w("#messageA").text = "Please choose a file to upload.";
        $w("#messageA").expand();
    }
    return array
}
// ========================================= VISITORS =========================================
function checkV() {
    $w('#messageV').collapse();
    $w('#sendV').disable()
    try {

        checkValidationV();
        saveV();

    } catch (err) {
        $w('#messageV').text = err.message;
        $w('#messageV').expand();
        $w('#sendV').enable();
    }
}

function checkValidationV() {
    if (!$w('#fullName').valid) throw new Error('Missing Full Name');
    if (!$w('#emailV').valid) throw new Error('Missing Email');
    if (!$w('#passV').valid) throw new Error('Missing password');
    if ($w('#passV').value.length < 6) throw new Error('Password should contain at least 6 characters');
}

async function saveV() {

    let json = {
        type: $w('#type').value,
        privateId: "id",
        fullName: $w('#fullName').value,
        email: $w('#emailV').value
    }
    //console.log(0, json)

    await signUp(json, $w('#passA').value).then(async (result) => {
        if (result.type === 'success') {

            json.privateId = result.id

            await wixData.insert("Users", json)
            await wixUsers.applySessionToken(result.sessionToken)
            $w('#messageA').text = result.message;
            $w('#messageA').expand();
            setTimeout(() => wixLocation.to('/'), 1000);
        } else {
            console.error(`${result.type} error occurred. Error message: ${result.message}`);
            $w('#messageA').text = `${result.type} error occurred.`;
            $w('#messageA').expand();
        }
    })
}