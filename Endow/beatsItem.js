import { createCheckout, getVariants } from 'backend/functions.web.js';
import { updateCollection } from 'backend/collections.web.js';
import { currentMember } from "wix-members-frontend";
import wixLocationFrontend from 'wix-location-frontend';
import { session } from "wix-storage-frontend";

let bronze, silver, gold, itemSelected, itemData, priceInvest;
let songName;

$w.onReady(function () {

    if (session.getItem("section")) {
        if (session.getItem("section") !== 'backThisBeat') $w('#secPurchase').scrollTo();
        else $w('#boxInvest').scrollTo();
        session.removeItem("section");
    }

    $w('#dynamicDataset').onReady(() => {
        itemData = $w('#dynamicDataset').getCurrentItem();

        // Update Beat Views
        let beatViews = (itemData.beatViews) ? (itemData.beatViews + 1) : 1;
        itemData.beatViews = beatViews;
        updateCollection("Beats", itemData);

        songName = itemData.title;
        // console.log(itemData)
        if (itemData.investorCheck) {
            $w('#btBackThisBeat').icon = "wix:vector://v1/f244d7_9087edcb57cb4fce96b3de95c110ff90.svg/";
            $w('#btBackThisBeat').label = "ENDORSED"
            $w('#btBackThisBeat').disable();
            $w('#boxInvest').collapse();
        } else {
            $w('#btBackThisBeat').icon = "";
        }

        $w('#form1').setFieldValues({ song_name: songName })

        getVariants(itemData.storeSong).then((items) => {
            console.log('items', items)
            bronze = items[0];
            // priceInvest = bronze;
            variantSelected(bronze, "#boxBronze", 'BRONZE');

            // Variants
            if (items[1]) silver = items[1], $w('#boxSilver').show() //, priceInvest = silver;
            else $w('#boxSilver').hide();
            if (items[2]) gold = items[2], $w('#boxGold').show() //, priceInvest = gold;
            else $w('#boxGold').hide();

            // Price for invest
            // const realPriceInvest = `$${parseFloat((parseFloat(priceInvest.variant.price) * 0.8)).toFixed(2)}`;
            // $w('#priceInvest').text = realPriceInvest;
        })

        $w('#boxBronze').onClick(() => variantSelected(bronze, "#boxBronze", 'BRONZE'));
        $w('#boxSilver').onClick(() => variantSelected(silver, "#boxSilver", 'SILVER'));
        $w('#boxGold').onClick(() => variantSelected(gold, "#boxGold", 'GOLD'));
        $w('#purchase').onClick(() => createCheckOutBackend(itemSelected, false))

        // $w('#btInvest').onClick(() => createCheckOutBackend(itemData.storeSong, false))
        $w('#btBackThisBeat').onClick(() => {
            try { $w("#form1").submit(); } catch (error) { console.log("Submission failed with an error:", error); }
            // createCheckOutBackend(priceInvest, true)
        })
    })

    currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
        $w('#form1').setFieldValues({
            first_name_ef29: member.contactDetails.firstName,
            last_name_76bf: member.contactDetails.lastName,
            email_3f45: member.loginEmail,
            phone_fba4: member.contactDetails.phones[0]
        })
    }).catch((error) => { console.error(error); });

    $w('#form1').onFieldValueChange((newValues) => {
        if (newValues.song_name !== songName) $w('#form1').setFieldValues({ song_name: songName })
    })

    $w('#audio').onPlay(() => {
        let audioPlays = (itemData.audioPlays) ? (itemData.audioPlays + 1) : 1;
        itemData.audioPlays = audioPlays;
        updateCollection("Beats", itemData);
    })
});

function variantSelected(variant, box, state) {
    $w('#stateLvL').changeState(state);

    itemSelected = variant;
    $w('#price').text = `${itemSelected.variant.formattedPrice}`

    const variants = [
        { box: "#boxBronze", text: "#txtBronze" },
        { box: "#boxSilver", text: "#txtSilver" },
        { box: "#boxGold", text: "#txtGold" }
    ];

    variants.forEach(({ box: variantBox, text }) => {
        const isSelected = variantBox === box;
        $w(variantBox).style.backgroundColor = isSelected ? "#FFFFFF" : "#1E1E21";
        $w(text).style.color = isSelected ? "#1E1E21" : "#FFFFFF";
    });
}

function createCheckOutBackend(item, invest) {
    createCheckout(item, invest).then((payment) => {
        wixLocationFrontend.to(payment.checkoutUrl)
    })
}