import { session } from 'wix-storage';
import { currentMember, authentication } from "wix-members-frontend";

$w.onReady(function () {
    code();
    getMember();
    authentication.onLogin(() => getMember());
});

function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
        if (member) {
            $w('#name').value = member.contactDetails.firstName;
            $w('#email').value = member.loginEmail;
        }
    }).catch((error) => { console.error(error); });
}

export function code() {
    let value = session.getItem("code"); // "value"
    if (value.length > 0) {
        console.log(value);
        $w('#input1').value = value;
        $w('#input1').disable();
    }
}