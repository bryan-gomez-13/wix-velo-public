import { session } from 'wix-storage';
import wixWindow from 'wix-window';
import wixData from 'wix-data';
import { currentMember } from 'wix-members';

$w.onReady(function () {
    let item = $w('#dynamicDataset').getCurrentItem()
    //console.log(item)

    if (session.getItem("role")) getInfo(session.getItem("role"), item)
    else {
        currentMember.getRoles().then((roles) => {
            if (!(roles.length == 0)) {
                session.setItem("role", roles[0].title)
                getInfo(roles[0].title, item)
            } else {
                getInfo("No", item)
            }
        })
    }
    getInfoUser();
    $w('#chat').onClick(() => initiateChat())

});

function getInfo(role, item) {
    console.log(role + "0", item)
    let v0 = role == "High School Student" || role == "Parents" || role == "College Student" || role == "College Graduate" || role == "Counselor"
    let v1 = item.role == "High School Student" || item.role == "Parents" || item.role == "College Student" || item.role == "College Graduate" || item.role == "Counselor"

    let v2 = role == "Sponsor"
    let v3 = item.role == "High School Student" || item.role == "Parents"

    let v4 = role == "High School Student" || role == "Parents"
    let v5 = item.role == "College Student" || item.role == "College Graduate" || item.role == "Counselor"
    let v6 = item.role == "Sponsor"

    // High School Student - Parents - College Student - College Graduate - Counselor
    if (!v6) {
        if (v0 && v1) {
            /*
            if (v4 && v5 && item.premium) $w('#chat').enable();
            else $w('#chat').disable(), $w('#messagePremium').text = "Premium ", $w('#messagePremium').show();   
            */

            fields(true, item)

            $w('#box').changeState('User');
            $w('#box').show();

            // Sponsor
        } else if (v2) {
            if (v3) {
                if (v5) {
                    $w('#message').text = "You are not allowed to view this user"
                    $w('#getPremium').hide();
                    $w('#box').changeState('GetPremium');
                    $w('#box').show();
                } else {
                    fields(true, item)
                    $w('#box').changeState('User');
                    $w('#box').show();
                }
            } else {
                $w('#box').changeState('Sponsor');
                $w('#box').show();
            }
            // No one
        } else {
            fields(false, item)
            $w('#box').changeState('User');
            $w('#box').show();
        }
    } else {
        $w('#message').text = "You are not allowed to view this user"
        $w('#getPremium').hide();
        $w('#box').changeState('GetPremium');
        $w('#box').show();
    }
}

function fields(option, item) {
    if (option) {
        //PREMIUM ACCESS
        if (item.role == "High School Student") {
            $w('#lastName').collapse();
            $w('#university').collapse();
            $w('#highestCollege').collapse();
            if (item.completeProfile == false) {
                $w('#hsName').collapse();
                $w('#yearGraduation').collapse();
                $w('#city').collapse();
                $w('#stateAll').collapse();
                $w('#myStory').collapse();
                $w('#college').collapse();
                $w('#major').collapse();
            }
        } else if (item.role == "Parents") {
            $w('#lastName').collapse();
            $w('#hsName').collapse();
            $w('#yearGraduation').collapse();
            $w('#university').collapse();
            $w('#college').collapse();
            $w('#major').collapse();
            $w('#highestCollege').collapse();
            if (item.completeProfile == false) $w('#myStory').collapse();
        } else if (item.role == "College Student" || item.role == "College Graduate" || item.role == "Counselor") {
            $w('#hsName').collapse();
            $w('#yearGraduation').collapse();
            $w('#college').collapse();
            if (item.completeProfile == false) $w('#myStory').collapse();
        }

    } else {
        //FREE ACCESS
        if (item.role == "High School Student") {
            $w('#lastName').collapse();
            $w('#university').collapse();
            $w('#highestCollege').collapse();
            $w('#myStory').collapse();
            if (item.completeProfile == false) {
                $w('#hsName').collapse();
                $w('#yearGraduation').collapse();
                $w('#city').collapse();
                $w('#stateAll').collapse();

                $w('#college').collapse();
                $w('#major').collapse();
            }
        } else if (item.role == "Parents") {
            $w('#lastName').collapse();
            $w('#hsName').collapse();
            $w('#yearGraduation').collapse();
            $w('#city').collapse();
            $w('#stateAll').collapse();
            $w('#myStory').collapse();
            $w('#university').collapse();
            $w('#college').collapse();
            $w('#major').collapse();
            $w('#highestCollege').collapse();
        } else if (item.role == "College Student" || item.role == "College Graduate" || item.role == "Counselor") {
            $w('#lastName').collapse();
        }
    }
}

function initiateChat() {
    wixWindow.openLightbox("Message", $w('#dynamicDataset').getCurrentItem())
}

function getInfoUser() {
    currentMember.getMember()
        .then((member) => {
            wixData.query('users').eq('privateId', member._id).find().then((result) => {
                let item = result.items[0]
                if (!(item.premium)) $w('#chat').disable(), $w('#messagePremium').text = "Premium Feature", $w('#messagePremium').show();
                else if (!(item.completeProfile)) $w('#messagePremium').text = "Complete your profile to Initiate a chat session", $w('#messagePremium').show();
                else $w('#chat').enable();

            }).catch((err) => console.log(err))
        }).catch((error) => console.error(error));
}