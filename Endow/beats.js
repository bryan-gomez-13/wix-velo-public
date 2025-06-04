import { generalQuery, updateCollection } from 'backend/collections.web.js';
import { createCheckout } from "backend/functions.web.js";
import wixLocationFrontend from 'wix-location-frontend';
import { session } from "wix-storage-frontend";
import wixPayFrontend from "wix-pay-frontend";
import wixWindowFrontend from 'wix-window-frontend';

$w.onReady(function () {
    $w('#dynamicDataset').onReady(() => {
        $w('#repBeats').onItemReady(($item, itemData) => {
            itemData.videoOk = false;
            if (itemData.investorCheck) {
                $item('#box1').style.backgroundColor = "#000000";
                $item('#btBackThisBeat').icon = "wix:vector://v1/f244d7_9087edcb57cb4fce96b3de95c110ff90.svg/";
                $item('#btBackThisBeat').label = "ENDORSED"
                $item('#btBackThisBeat').disable();
                $item('#itemTitle').style.color = "#FFFFFF";
                $item('#itemProducer1').style.color = "#FFFFFF";
                $item('#itemProducer2').style.color = "#FFFFFF";
                $item('#itemDescription').style.color = "#FFFFFF";
            } else {
                $item('#btBackThisBeat').icon = "";
            }

            $item('#btBackThisBeat').onClick(() => {
                session.setItem("section", "backThisBeat");
                wixLocationFrontend.to(itemData['link-beats-title'])
            })

            $item('#btPurchaseThisBeat').onClick(() => {
                session.setItem("section", "purchaseThisBeat");
                wixLocationFrontend.to(itemData['link-beats-title'])
            })

            $item('#audio').onPlay(() => {
                if (itemData.videoOk == false) {
                    itemData.videoOk = true;

                    let audioPlays = (itemData.audioPlays) ? (itemData.audioPlays + 1) : 1;
                    itemData.audioPlays = audioPlays;
                    updateCollection("Beats", itemData);

                    $item('#audio').pause();

                    if (itemData.artistInfo.premium) {
                        wixWindowFrontend.openLightbox('ArtistVideo', itemData).then(() => {
                            $item('#audio').play();
                        });
                    }
                }

            })

            if (itemData.artists) {
                generalQuery('Artists', '_id', itemData.artists).then((result) => {
                    const artistInfo = result[0];
                    if (artistInfo.premium) itemData.artistInfo = artistInfo;
                })
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