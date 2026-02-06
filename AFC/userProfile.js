import { currentMember } from "wix-members-frontend";
import { generalQuery, updateCollection } from 'backend/collections.web.js';
import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(function () {
    getMember();

    $w('#dataset1').onAfterSave(() => {
        setTimeout(() => {
            wixLocationFrontend.to('/forms-certificate')
        }, 5000);
    })

});

function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        console.log(member)
        let filter = wixData.filter().eq('memberId', member._id);
        $w('#dataset1').setFilter(filter);

        generalQuery('Members', 'memberId', member._id).then((currentMemberInfo) => {
            console.log(currentMemberInfo)
            if (currentMemberInfo.length > 0) {
                if (currentMemberInfo[0].redirect) {
                    console.log(currentMemberInfo[0])

                    if (currentMemberInfo[0].nationality) $w('#pdNext').label = 'Update';
                    else $w('#pdNext').label = 'Save';

                    $w('#boxMember').changeState('profile');
                } else {
                    let item = currentMemberInfo[0];
                    item.redirect = true;
                    updateCollection('Members', item);
                }
            } else {
                $w('#boxMember').changeState('admin');
            }
        })
    }).catch((error) => {
        console.error(error);
        getMember()
    });
}