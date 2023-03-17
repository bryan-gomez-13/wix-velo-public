import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { email } from 'backend/Email.jsw'
import { currentMember } from 'wix-members';
var item

$w.onReady(function () {
    getUser();
    $w('#send').onClick(async () => {
        $w('#send').disable();
        $w('#loading').show();
        await email($w('#yourInformation').value, $w('#message').value, wixWindow.lightbox.getContext(), item)
        $w('#loading').hide();
        $w('#messageT').text = "Email Done"
        $w('#messageT').show();
        //setTimeout(() => wixWindow.lightbox.close(), 2000); 
        setTimeout(() => wixLocation.to('/users'), 2000); 
    })
});

function getUser() {
    currentMember.getMember().then((member) => {
        wixData.query('users').eq('privateId', member._id).find()
            .then(async (result) => {

                item = result.items[0]
                let message = "Name: " + item.firstName + " " + item.lastName + "\n\n"
                message += "Email: " + item.email + "\n\n"
                message += "City: " + item.city + "\n\n"
                let state = await getState(item.state)
                message += "State: " + state + "\n\n"

                if (item.role == "High School Student") {
                    message += "HS Name: " + item.hsName + "\n\n"
                    message += "HS Graduation Year: " + item.hsGraduationYear + "\n\n"
                    message += "College you wish to attend: " + item.collegeYouWishToAttend + "\n\n"
                    message += "Major: " + item.major + "\n\n"
                }
                message += "My Story: " + item.myStory

                $w('#yourInformation').value = message
            }).catch((err) => console.log(err))
    }).catch((error) => console.log(error));
}

function getState(state) {
    return wixData.query('States').eq('_id', state).find().then((result) => { return result.items[0].state })
}