import { insertProductsHistory, deleteOrders, insertReference } from 'backend/reference.jsw';
import { sendEmailDespatch } from 'backend/emails.jsw'
import { getIdUser } from 'backend/querys.jsw';

import wixData from 'wix-data';

let customer;

$w.onReady(function () {
    $w('#text124').collapse()
    $w("#table1").onRowSelect(async (event) => {
        $w('#despatchEmail').enable();
        let rowData = event.rowData;
        let id = await getIdUser(rowData.email)
        wixData.queryReferenced("Users", id, "myProducts")
            .then((results) => {
                let items = results.items[0];
                $w('#shippingOption').text = items.shippingOption;
            })
        $w('#statebox8').changeState("despatch")
        $w('#packageArrival').text = rowData.fullName
        $w('#supplier').text = rowData.suiteId
        $w('#emailCustomer').text = rowData.email
        $w('#text132').collapse();
    });
});

export function button12_click(event) {
    customer = $w('#searchCustomer').value;
    $w('#Despatch').setFilter(wixData.filter().eq("user", customer).and(wixData.filter().eq("readyToDespatch", true)))
    if ($w('#Despatch').getTotalCount() === 0) {
        $w('#text124').expand();
    } else if ($w('#Despatch').getTotalCount() != 0) {
        $w('#text124').collapse();
        $w('#button12').expand();
    }
}

export function clear_click(event) {
    $w('#searchCustomer').value = "";
    $w('#searchCustomer').resetValidityIndication();
    $w('#Despatch').setFilter(wixData.filter().not(wixData.filter().and(wixData.filter().eq("readyToDespatch", true))))
    $w('#text124').collapse()
}

export function back_click(event) {
    $w('#statebox8').changeState("products")
}

export async function despatchEmail_click(event) {
    $w('#despatchEmail').disable();
    let email = $w('#emailCustomer').text
    let id = await getIdUser(email)
    let trackInfo = $w('#tracketInfo').value

    insertProductsHistory(email);
    insertReference(email);

    wixData.query("Users")
        .eq("email", email)
        .find()
        .then((results) => {
            let items = results.items
            let options = {
                memberId: items[0].idPrivateMember,
                memberName: items[0].fullName,
                suiteNumber: items[0].suiteId,
                trackInfo: trackInfo
            }
            sendEmailDespatch(options)
                .then((results) => {
                    setInterval(() => {
                        $w('#statebox8').changeState("products")
                    }, 4000)
                    $w('#text132').expand();
                    $w('#despatchEmail').collapse();
                })
        })

    wixData.query("Users")
        .eq("_id", id)
        .find()
        .then((results) => {
            let items = results.items[0];
            items.readyToDespatch = false;
            wixData.save("Users", items)
                .then((results) => {
                    $w('#Despatch').setFilter(wixData.filter().eq("user", customer).and(wixData.filter().eq("readyToDespatch", true)))
                })
        })
}

export function tracketInfo_change(event) {
    let value = $w('#tracketInfo').value;
    if (value != "") {
        $w('#despatchEmail').enable();
    } else {
        $w('#despatchEmail').disable();
    }
}