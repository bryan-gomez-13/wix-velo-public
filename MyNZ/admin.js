import wixData from 'wix-data';
import { myApproveByEmailFunction } from 'backend/admin'

let endDate;
const todayDate = new Date();
const days = new Date();
let endPlan;
let daysEndPlan;
let dateEnd;
let dateFrom;
let daysF;
let diff;

$w.onReady(function () {

});

export function searchUser(event) {
    $w('#Activate').enable();
    $w('#alert1').collapse();
    $w('#alert2').collapse();

    bActivate($w('#email').value)

    $w("#DataUsers").setFilter(wixData.filter()
        .eq("email", $w('#email').value)
    );

    wixData.query("Users").eq("email", $w('#email').value)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                if(results.items[0].typeDoc == "Image"){
                    $w('#document3').collapse()
                    $w('#image').expand()
                }else{
                    $w('#image').collapse()
                    $w('#document3').expand()
                     $w('#document3').link = results.items[0].documentId
                }
                $w('#box1').expand();
                $w('#text129').collapse();
                let items = results.items[0].completeAddress
                let itemsForwading = results.items[0].forwardingAddress
                let itemsDate = results.items[0].days
                $w('#completeA').value = items.formatted
                $w('#forwardingA').value = itemsForwading.formatted
                dateFrom = todayDate.getDate()
                diff = itemsDate - dateFrom + todayDate.getDate();
                console.log(diff);
                $w('#days').value = diff.toString();

               
            } else {
                $w('#box1').collapse();
                $w('#text129').expand();
            }
        })

    $w('#image').tooltip = '';
    $w('#image').alt = '';
    

}

function clear() {
    $w('#name').value = "";
    $w('#mobile').value = "";
    $w('#Email').value = "";
    $w('#SuiteID').value = "";
    $w('#gender').value = "";
    $w('#birthday').value = "";
    $w('#typeID').value = "";
    $w('#completeA').value = "";
    $w('#forwardingA').value = "";
    $w('#MembershipP').value = "";
    $w('#endP').value = "";
    $w('#days').value = "";
}

//================================================== ACTIVATE MEMBER ==================================================
export async function activateMember() {
    console.log("Activate Member")
    let email = $w('#email').value

    await wixData.query("Users")
        .eq("email", email)
        .find()
        .then(async (results) => {

            if (results.items[0].idPrivateMember == "" || results.items[0].idPrivateMember == null || results.items[0].idPrivateMember == undefined) {
                $w('#alert3').text = "Please add the idPrivateMember field of this email " + email;
                $w('#alert3').expand();
            } else {
                $w('#alert3').collapse();
                $w('#alert2').collapse();
                $w('#alert1').expand();
                $w('#Activate').disable();
                await myApproveByEmailFunction(email, endDate.toDateString(), parseInt(daysF.toFixed()));
                $w('#alert1').collapse();
                $w('#alert2').expand();
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
    bActivate(email)
}

//=========================================== ACTIVATE MEMBER ===========================================
export async function x() {
    let email = $w('#email').value;

    console.log("here");
    let options = {
        "suppressAuth": true,
        "suppressHooks": true
    };

    wixData.query("Members/PrivateMembersData")
        //.eq('loginEmail',email)
        .find(options)
        .then((results) => {
            if (results.items.length > 0) {
                let items = results.items;
                let firstItem = items[0];
                console.log(items)
            } else {
                // handle case where no matching items found
            }
        })
        .catch((error) => {
            let errorMsg = error.message;
            let code = error.code;
            console.log(errorMsg, code)
        });
    console.log("here2");
}

function bActivate(email) {
    wixData.query("Users")
        .eq("email", email)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                //console.log(results.items[0]);
                //console.log(results.items[0].completeAddress.formatted)
                if (results.items[0].active == false) {
                    $w('#Activate').expand();
                    $w('#date').expand();

                } else {
                    $w('#Activate').collapse();
                    $w('#date').collapse();
                }
            } else {
                clear();
            }
        })
        .catch((err) => {
            console.log(err)
        });
}

export function endDate_change(event) {
    endDate = $w('#endDate').value;
    dateFrom = todayDate.getTime()
    dateEnd = endDate.getTime()
    diff = dateEnd - dateFrom;
    daysF = diff / (1000 * 60 * 60 * 24) + 1;
    $w('#Activate').enable()
    $w('#end').text = daysF.toFixed();
}