import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
import { putRole } from 'backend/SignUp.jsw';
var memberId

$w.onReady(function () {
    currentMember.getMember()
        .then((member) => {
            memberId = member._id;
            wixData.query("users").eq('privateId', memberId).find()
                .then((results) => {
                    if (results.items[0].premium == true) $w('#demo').disable();
                    else $w('#demo').enable();
                }).catch((err) => console.log(err));
        }).catch((error) => console.error(error));

    $w('#demo').onClick(async () => {
        await putRole(memberId)
		setTimeout(() => wixLocation.to('/'), 2000);
    })
});