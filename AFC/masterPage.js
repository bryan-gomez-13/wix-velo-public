import { currentMember, authentication } from "wix-members-frontend";
import wixLocationFrontend from 'wix-location-frontend';

import { generalQuery2 } from 'backend/collections.web.js';

$w.onReady(function () {
    getMember();
    authentication.onLogin(async (member) => {
        const loggedInMember = await member.getMember();
        validateCompleteProfiel(loggedInMember._id);
    });
});

function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        if (member) validateCompleteProfiel(member._id);
    }).catch((error) => { console.error(error); });
}

function validateCompleteProfiel(memberId) {
    generalQuery2('Members', 'memberId', memberId, 'redirect', true).then((currentMember) => {
        if (currentMember.length == 0) wixLocationFrontend.to('/complete-user-profile')
    })
}