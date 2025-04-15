import { createCheckout } from "backend/functions.web.js";
import wixPayFrontend from "wix-pay-frontend";

$w.onReady(function () {
    $w('#dynamicDataset').onReady(() => {
        $w('#repBeats').onItemReady(($item, itemData) => {
            if (itemData.investorCheck) {
                $item('#box1').style.backgroundColor = "#000000";
                $item('#btBackThisBeat').icon = "wix:vector://v1/f244d7_9087edcb57cb4fce96b3de95c110ff90.svg/";
                $item('#btBackThisBeat').label = "ENDORSED"
                $item('#btBackThisBeat').disable();
                $item('#itemTitle').style.color = "#FFFFFF";
                $item('#itemProducer1').style.color = "#FFFFFF";
                $item('#itemProducer2').style.color = "#FFFFFF";
                $item('#itemDescription').style.color = "#FFFFFF";
            }else{
                $item('#btBackThisBeat').icon = "";
            }
            // $item('#btInvest').onClick(() => createCheckOutBackend(itemData.storeSong, false))
            // $item('#btBackThisBeat').onClick(() => createCheckOutBackend(itemData.storeSong, true))
        })
    })
});

function createCheckOutBackend(itemId, invest) {
    createCheckout(itemId, invest).then((payment) => {
        console.log("payment3", payment)
        wixPayFrontend.startPayment(payment.orderId);
    })
}