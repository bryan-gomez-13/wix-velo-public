import { currentMember, authentication } from 'wix-members';
import wixData from 'wix-data';
var memberID = ""

$w.onReady(async function () {
    await getMember();
    await getTestimonies();
    authentication.onLogin(async (member) => getMember());
});

// Change the link if user is login or no
async function getMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options)
        .then((member) => {
            if (member) {
                memberID = member._id
                $w('#button8').label = "Booking"
                $w('#button8').link = "/booking"

                $w('#btCH').label = "Booking"
                $w('#btCH').link = "/booking"

                $w('#btY').label = "Booking"
                $w('#btY').link = "/booking"
            } else {
                $w('#button8').label = "Join Today"
                $w('#button8').link = "/memberships"

                $w('#btCH').label = "Join Today"
                $w('#btCH').link = "/memberships"

                $w('#btY').label = "Join Today"
                $w('#btY').link = "/memberships"
            }
        }).catch((error) => {
            console.error(error);
        });
}

async function getTestimonies() {
    await wixData.query('Testimonies').find().then((result) => {
        console.log(result)
        $w('#testimonies').text = "Oneo has transformed the lives of more than " + (parseInt(result.totalCount) + 907) + " individuals";
        $w('#testimonies').show();
    }).catch((err) => console.log(err))
}