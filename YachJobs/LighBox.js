//import { sendEmail } from 'backend/sendEmail';
import { emailJobs } from 'backend/Email.jsw'
import wixWindow from 'wix-window';

$w.onReady(function () {
    $w('#send').onClick(() => validation())
});

function validation() {
    $w('#error').hide()
    try {
        check();
        sendE();
    } catch (error) {
        $w('#error').text = error.message;
        $w('#error').show();
    }
}

async function sendE() {
    $w('#error').hide()
    let email = await wixWindow.lightbox.getContext().email
    let position = await wixWindow.lightbox.getContext().position

    $w("#pdf").uploadFiles()
        .then((uploadedFiles) => {
            uploadedFiles.forEach(uploadedFile => {
                console.log(uploadedFile)
                let json = {
                    email: email,
                    yourEmail: $w("#email").value,
                    position: position,
                    fullName: $w('#fullName').value,
                    check: $w("#checkbox1").checked,
                    subject: $w("#subject").value,
                    message: $w("#message").value,
                    link: "https://a8bde1ab-db13-406c-a30d-ce2ed7922567.usrfiles.com/ugd/" + uploadedFile.fileName
                }
                emailJobs(json)
                    .then(() => {
                        $w("#error").hide()
                        $w("#sent").show()
                        setTimeout(() => wixWindow.lightbox.close(), 2000);
                    })

            })
        })
        .catch((uploadError) => {
            $w('#error').text = uploadError.errorDescription;
            $w('#error').show();
        });
}

function check() {
    if (!$w('#email').valid) throw new Error('Missing Email');
    if (!$w('#fullName').valid) throw new Error('Missing Full Name');
    if (!$w('#subject').valid) throw new Error('Missing subject');
    if (!$w('#message').valid) throw new Error('Missing message');
}

/*
export async function button2_click(event) {
    let email = await wixWindow.lightbox.getContext()
    let yourEmail = $w("#input1").value
    let subject = $w("#input2").value
    let message = $w("#textBox1").value
    let resume
    if (yourEmail && subject && message) {
        $w("#uploadButton1").startUpload()
            .then((file) => {
                console.log(file)
                let attachment = file.url
                let baseEnd = attachment.substring(18)
                let mainMiddle = baseEnd.split("/")[0]
                resume = "https://a8bde1ab-db13-406c-a30d-ce2ed7922567.usrfiles.com/ugd/" + mainMiddle
                console.log(resume)
            }).then(() => {
                sendEmail(email, "new message from Yacht Jobs | " + subject, "jobs@yachtjobs.org", "Sender Email: " + yourEmail + " " + message + " | " + resume)
                    .then(() => {
                        $w("#error").hide()
                        $w("#sent").show()
                        setTimeout(() => {
                            wixWindow.lightbox.close()
                        }, 1250);
                    })
            })
    } else {
        $w("#error").show()
    }
}
*/