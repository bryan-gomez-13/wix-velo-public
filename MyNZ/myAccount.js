import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { currentMember } from 'wix-members';

let emailCurrentUser = wixUsers.currentUser;
let days;
const today = new Date();
const todateDate = new Date(today);
let dateFrom;
let itemsDate

$w.onReady(async function () {
    setInterval(() => {}, 3000)
    methods();
    getInformation();
});

// ADD FUNCTION IN EACH BUTTON
function methods() {
    $w('#bChangeAddress').onClick(() => $w('#boxUpgradeAddress').expand() && $w('#bChangeAddress').collapse());
    $w('#bUpgrade').onClick(() => changeAddress());
}

async function getInformation() {
    let email = await emailCurrentUser.getEmail();
    await wixData.query("Users").eq("email", email)
        .find()
        .then((results) => {
            let items = results.items;
            itemsDate = items[0].days;
            dateFrom = today.getDate()
            days = itemsDate - dateFrom + today.getDate();
            $w('#days').text = "Remaining days: " + days.toString();
            $w('#suiteId').text = "SuiteID: " + items[0].suiteId
            $w('#completeAddress').text = "Current Residence: " + items[0].completeAddress.formatted;
            $w('#forwardingAddress').text = "Forwarding Address: " + items[0].forwardingAddress.formatted;
        })

    await currentMember.getRoles()
        .then((roles) => {
            // Replaces currentUser.role and currentUser.getRoles()
            if (roles[0].title === "Admin" || roles[0].title === "warehouse") {
                $w('#box2').expand();
            } else {
                $w('#box2').collapse();
            }
            //console.log(roles);
        })
        .catch((error) => {
            console.error(error);
        });
}

async function changeAddress() {
    let email = await emailCurrentUser.getEmail();
    await wixData.query("Users").eq("email", email)
        .find()
        .then((results) => {
            let address = {
                "city": $w('#forwardingA').value.city,
                "country": $w('#forwardingA').value.country,
                "formatted": $w('#forwardingA').value.formatted,
                "postalCode": $w('#forwardingA').value.postalCode,
            }
            results.items[0].forwardingAddress = address;
            wixData.update("Users", results.items[0])
        })
        .catch((err) => {
            console.log(err);
        });
    $w('#alert').show();
}