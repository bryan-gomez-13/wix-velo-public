import { lightbox } from 'wix-window';
import wixWindow from 'wix-window';
import { currentMember } from 'wix-members';
import { getMemberBack } from 'backend/Collections.jsw'

$w.onReady(async function () {
    await getCurrentMember()
    let data = lightbox.getContext();
    $w('#courseName').value = data.title
    $w('#wixForms1').onWixFormSubmitted(() => wixWindow.lightbox.close());
});

async function getCurrentMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options).then(async (member) => {
            let privateId = member._id
            let json = await getMemberBack(privateId)
            $w('#firstName').value = json.name
            $w('#surname').value = json.surname
            $w('#email').value = json.email
            //$w('#instructorName').value = json.name + " " + json.surname
        })
        .catch((error) => console.error(error));
}