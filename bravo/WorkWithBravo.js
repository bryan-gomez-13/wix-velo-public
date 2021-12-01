import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(function () {
    $w('#firstName').onInput(() => elements())
    $w('#lastName').onInput(() => elements())
    $w('#email').onInput(() => elements())
    $w('#phone').onInput(() => elements())
    $w('#message').onInput(() => elements())
    $w('#desplegable').onChange(() => elements())
});

export async function saveCV() {

$w("#CV").uploadFiles()
    .then((uploadedFiles) => {
        uploadedFiles.forEach(async uploadedFile => {
            //console.log('File url:', uploadedFile.fileUrl);
            let json = {
                "firstName": $w("#1").value,
                "lastName": $w("#2").value,
                "email": $w("#3").value,
                "phone": $w("#4").value,
                "message": $w("#5").value,
                "desplegable": $w("#6").value,
                "cv":uploadedFile.fileUrl
            }
            await wixData.insert("contact03", json);
            //console.log("save")
            wixLocation.to('/thank-you')

        })
    })
    .catch((uploadError) => {
        console.log(uploadError)
    });
}

function elements() {
    $w('#1').value = $w('#firstName').value;
    $w('#2').value = $w('#lastName').value;
    $w('#3').value = $w('#email').value;
    $w('#4').value = $w('#phone').value;
    $w('#5').value = $w('#message').value;
    $w('#6').value = $w('#desplegable').value;
}