import { updateR, generateInvoice } from 'backend/querys.jsw'
import { sendEmailInvoice, sendEmailInvoiceToWareHosye } from 'backend/emails.jsw'
import wixData from 'wix-data';
import wixUsers from 'wix-users';

let shippingOption;
let totalPrice = 0;
let totalCW = 0;

$w.onReady(async function () {
    setInterval(() => {
        $w('#shippingOption').enable();
    }, 6000)
    let emauilCurrentUser = await wixUsers.currentUser.getEmail();
    await $w('#dataset1').setFilter(wixData.filter().eq("user", emauilCurrentUser).and(wixData.filter().eq("shippingOption", "Pending")))
    if ($w('#dataset1').getTotalCount() === 0) {
        $w('#text130').expand();
    } else if ($w('#dataset1').getTotalCount() != 0) {
        $w('#text130').collapse();
        $w('#button12').expand();
        calculateData();
    }
});

export async function button12_click_1(event) {
    let emauilCurrentUser = await wixUsers.currentUser.getEmail();
    $w('#button12').disable()
    await generateInvoice()
        .then((results) => {
            updateR(shippingOption)
                .then((results) => {
                    wixData.query("Users").eq("email", emauilCurrentUser)
                        .find()
                        .then((results) => {
                            let itemsData = results.items;
                            let options = {
                                memberName: itemsData[0].fullName + itemsData[0].surname,
                                suiteNumber: itemsData[0].suiteId,
                                shippingOption: shippingOption
                            }
                            sendEmailInvoice(options)
                                .then((results) => {
                                    $w('#shippingOption').value = "";
                                    $w('#shippingOption').resetValidityIndication();
                                    $w('#shippingOption').disable();
                                    $w('#text124').expand();
                                    $w('#dataset1').setFilter(wixData.filter().eq("user", emauilCurrentUser).and(wixData.filter().eq("shippingOption", "Pending")))
                                    $w('#text129').text = "0";
                                    $w('#text128').text = "0";
                                    $w('#text130').expand();
                                    $w('#button12').collapse();
                                    setTimeout(() => {
                                        $w('#text124').collapse();
                                    }, 5000)
                                })
                        })

                })
                .catch((error) => {
                    console.log(error);
                })

        })
}

export function shippingOption_change(event) {
    shippingOption = $w('#shippingOption').value;
    $w('#button12').enable()
}

function calculateData() {
    for (let i = 0; i < $w('#table1').rows.length; i++) {
        totalPrice += parseFloat($w('#table1').rows[i].chargeableWeight)
        totalCW += parseFloat($w('#table1').rows[i].totalPrice)
    }

    if (totalPrice.toString() && totalCW.toString() === "NaN") {
        $w('#text128').text = "0"
        $w('#text129').text = "0"
    } else {
        $w('#text128').text = totalPrice.toString();
        $w('#text129').text = totalCW.toString();
    }

}