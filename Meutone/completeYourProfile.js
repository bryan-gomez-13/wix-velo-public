import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
import { updateMember } from 'backend/signUp.jsw'

var imageId, Image
$w.onReady(function () {
    init();
    begin();
});

function init() {

    //Photo
    $w('#profilePhoto').onChange(() => uploadPicture())

    //send Info
    $w('#sendA').onClick(() => checkA())

    //search email
    $w('#emailA').onInput(() => getEmail($w('#emailA').value))
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

// ========================================= BEGIN =========================================
async function begin() {
    currentMember.getMember()
        .then(async (member) => {
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

            await wixData.query("Artist").eq('privateId', member._id).find().then((results) => {
                let item = results.items[0]
                $w('#artistBandName').value = item.artistName
                $w('#emailA').value = item.email
                if (item.ok) {
                    $w('#typeOfArtist').value = item.typeOfArtist
                    $w('#artistGenre').value = item.artistGenre
                    $w('#briefBio').value = item.briefBio
                    $w('#photo').src = item.profilePhoto
                    $w('#photo').alt = item.firstName + " " + item.lastName
                    $w('#photo').tooltip = item.firstName + " " + item.lastName

                    if (item.youtube) $w('#youtube').value = item.youtube
                    if (item.facebook) $w('#facebook').value = item.facebook
                    if (item.instagram) $w('#instagram').value = item.instagram
                    if (item.twitter) $w('#twitter').value = item.twitter
                    if (item.bandcamp) $w('#bandcamp').value = item.bandcamp
                    if (item.artistsMusicLinks) $w('#artistsMusicLinks').value = item.artistsMusicLinks

                    $w('#loading').hide()
                    $w('#box').show()
                } else {
                    $w('#artistBandName').enable();
                    $w('#typeOfArtist').enable();
                    $w('#artistGenre').enable();

                    $w('#loading').hide()
                    $w('#box').show()
                }
            }).catch((err) => console.log(err));
        }).catch((error) => console.error(error));
}

// ========================================= GET EMAIL =========================================
async function getEmail(email) {
    $w('#messageA').collapse()
    await wixData.query("Artist").eq('email', email).find()
        .then((results) => {
            if (results.items.length > 0) {

                $w('#messageA').text = "This email alredy exist."
                $w('#messageA').expand()
                $w('#messageA').scrollTo()
                $w('#sendA').disable()

            } else {
                $w('#sendA').enable()
            }
        }).catch((err) => console.log(err));
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
    if ($w("#profilePhoto").value.length > 0)
        if (!($w("#profilePhoto").value.length > 0)) throw new Error('Missing Profile Photo');
    if (!$w('#artistBandName').valid) throw new Error('Missing Artist/Band Name');
    if (!$w('#emailA').valid) throw new Error('Missing Email');
    if (!$w('#typeOfArtist').valid) throw new Error('Missing Type of Artist');
    if (!$w('#artistGenre').valid) throw new Error('Missing Artist Genre');
    if (!$w('#briefBio').valid) throw new Error('Missing Brief Bio');
    if ($w("#artistPhotosCoverArt").value.length > 0)
        if (!($w("#artistPhotosCoverArt").value.length > 0)) throw new Error('Missing Artist Photos/ Cover Art');

    if ($w('#youtube').value.length > 0) {
        if (!($w('#youtube').value.includes('https://'))) throw new Error('Missing youtube or https://');
        if (!$w('#youtube').valid) throw new Error('Missing youtube or http://');
    }
    if ($w('#facebook').value.length > 0) {
        if (!($w('#facebook').value.includes('https://'))) throw new Error('Missing facebook or https://');
        if (!$w('#facebook').valid) throw new Error('Missing facebook or https://');
    }

    if ($w('#instagram').value.length > 0) {
        if (!($w('#instagram').value.includes('https://'))) throw new Error('Missing instagram or https://');
        if (!$w('#instagram').valid) throw new Error('Missing instagram or https://');
    }

    if ($w('#twitter').value.length > 0) {
        if (!($w('#twitter').value.includes('https://'))) throw new Error('Missing twitter or https://');
        if (!$w('#twitter').valid) throw new Error('Missing twitter or https://');
    }

    if ($w('#bandcamp').value.length > 0) {
        if (!($w('#bandcamp').value.includes('https://'))) throw new Error('Missing bandcamp or https://');
        if (!$w('#bandcamp').valid) throw new Error('Missing bandcamp or https://');
    }

    if ($w('#artistsMusicLinks').value.length > 0) {
        if (!($w('#artistsMusicLinks').value.includes('https://'))) throw new Error('Missing Artist Music Links or https://');
        if (!$w('#artistsMusicLinks').valid) throw new Error('Missing Artist Music Links or https://');
    }

}

async function saveA() {
    $w('#loadingSave').show();
    //upload Photos
    let photos
    if ($w("#artistPhotosCoverArt").value.length > 0) photos = await uploadhotos();

    currentMember.getMember()
        .then(async (member) => {
            wixData.query("Artist").eq('privateId', member._id).find()
                .then(async (results) => {
                    let artist = results.items[0]
                    if ($w("#profilePhoto").value.length > 0) artist.profilePhoto = imageId
                    artist.artistName = $w('#artistBandName').value
                    artist.typeOfArtist = $w('#typeOfArtist').value
                    artist.artistGenre = $w('#artistGenre').value
                    artist.briefBio = $w('#briefBio').value
                    if ($w("#artistPhotosCoverArt").value.length > 0) artist.artistPhotosCoverArt = photos
                    artist.ok = true

                    if ($w('#youtube').value.length > 0) artist.youtube = $w('#youtube').value
                    if ($w('#facebook').value.length > 0) artist.facebook = $w('#facebook').value
                    if ($w('#instagram').value.length > 0) artist.instagram = $w('#instagram').value
                    if ($w('#twitter').value.length > 0) artist.twitter = $w('#twitter').value
                    if ($w('#bandcamp').value.length > 0) artist.bandcamp = $w('#bandcamp').value
                    if ($w('#artistsMusicLinks').value.length > 0) artist.artistsMusicLinks = $w('#artistsMusicLinks').value

                    if ($w("#profilePhoto").value.length > 0) await updateMember(artist.privateId, artist)

                    //Waiting
                    await wixData.update("Artist", artist)
                        .then((results) => setTimeout(() => wixLocation.to('/'), 1000))
                        .catch((err) => console.log(err));
                }).catch((err) => console.log(err));
        })
        .catch((error) => console.error(error));
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