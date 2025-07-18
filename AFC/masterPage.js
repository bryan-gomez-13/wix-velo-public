import { currentMember, authentication } from "wix-members-frontend";
import wixLocationFrontend from 'wix-location-frontend';
import { session } from "wix-storage-frontend";

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
        if (member) {
            currentMember.getRoles().then((roles) => {
                if (roles.length == 0) validateCompleteProfiel(member._id);
            }).catch((error) => { console.error(error); });
        }
    }).catch((error) => { console.error(error); });
}

function validateCompleteProfiel(memberId) {
    generalQuery2('Members', 'memberId', memberId, 'redirect', true).then((currentMember) => {
        if (currentMember.length == 0 && !session.getItem('ok')) {
            session.setItem('ok', 'true');
            wixLocationFrontend.to('/complete-user-profile')
        }
    })
}