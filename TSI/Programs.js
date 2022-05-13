import { currentMember } from 'wix-members';
import wixLocation from 'wix-location';

$w.onReady(function () {
    //role();
    email();
});

function role() {
    currentMember.getRoles()
        .then((roles) => {
            //console.log(roles)
            let x = false;
            for (let i = 0; i < roles.length; i++) {
                let element = roles[i]._id;
                if (element == "e5b1a45c-f516-4d34-95aa-da04e8377c9b") {
                    x = true;
                    break
                }
            }
            if (x) {
                wixLocation.to('/special-clients')
            } else {
                wixLocation.to('/online-programs')
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

function email() {
    currentMember.getMember()
        .then((member) => {
            //console.log(member)
            let typeEmail = member.loginEmail.split('@')
            if (typeEmail[1].includes('.mil') || typeEmail[1].includes('.gov')) {
                wixLocation.to('/special-clients')
            } else {
                wixLocation.to('/online-programs')
            }
        })
        .catch((error) => {
            console.error(error);
        });
}