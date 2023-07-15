import { currentMember, authentication } from 'wix-members';
import { memory } from 'wix-storage-frontend';
import { updateUsers } from 'backend/data.jsw'

$w.onReady(function () {
    getMember();
    authentication.onLogin(async (member) => getMember());
});

async function getMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options)
        .then(async (member) => {
            if (member) {
                //console.log(member)
                $w('#button14').label = "Booking"
                $w('#button14').link = "/booking-v2"

                if (!(memory.getItem("key"))) {
                    await updateUsers(member._id)
                    memory.setItem("key", "true")
                }else console.log("Done")

            } else {
                $w('#button14').label = "Join Today"
                $w('#button14').link = "/memberships"
            }
        }).catch((error) => {
            console.error(error);
        });
}