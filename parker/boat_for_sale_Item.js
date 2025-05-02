import { session } from 'wix-storage';
import wixLocation from 'wix-location';
import { updateCollection, updateFavorite } from 'backend/collections.web.js';
import { currentMember, authentication } from "wix-members-frontend";

let itemData, memberId, alreadyUpdated = false,
    followSave = false;

$w.onReady(async function () {
    $w('#dynamicDataset').onReady(async () => {
        itemData = $w('#dynamicDataset').getCurrentItem();

        const viewKey = `viewed_${itemData._id}`;

        // Check if already updated in this session for this specific item
        if (!session.getItem(viewKey)) {
            session.setItem(viewKey, "true"); // mark as viewed in session

            const currentViews = parseInt(itemData.viewers) || 0;
            itemData.viewers = currentViews + 1;
            itemData.updateViewer = true;

            await updateCollection('BoatsForSale2', itemData)
                .then((itemResult) => console.log("Viewers updated", itemResult))
                .catch((err) => console.error("Error updating viewers:", err));
        }

        if (itemData.youtube) {
            $w('#boxYoutube').expand();
        } else {
            $w('#boxYoutube').collapse();
        }
    });

    // Get member info
    getMember();
    authentication.onLogin(() => { getMember(); });

    $w('#btFavorite').onClick(() => updateFavoriteBoat());
    $w('#contact').onClick(() => contact());
});

async function updateFavoriteBoat() {
    if (memberId) {
        const itemFavorite = await updateFavorite('BoatsForSale2', '_id', itemData._id, 'favorite', memberId, true);
        if (itemFavorite) {
            //$w('#btFavorite').style.backgroundColor = "#E21C21";
            $w('#btFavorite').label = "Add to Watchlist";
        } else {
            //$w('#btFavorite').style.backgroundColor = "#0BAED3";
            $w('#btFavorite').label = "Unfollow";
        }
    } else {
        followSave = true;
        authentication
            .promptLogin({ mode: 'login', modal: true })
            .then(() => { console.log("Member is logged in") })
            .catch((error) => { console.error(error) });
    }
}

function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        if (member) {
            memberId = member._id;
            const itemBoat = await updateFavorite('BoatsForSale2', '_id', itemData._id, 'favorite', memberId, false);
            if (itemBoat.items.length > 0) {
                // $w('#btFavorite').style.backgroundColor = "#0BAED3";
                $w('#btFavorite').label = "Unfollow";
            }

            if (followSave) updateFavoriteBoat(), followSave = false;
        }
    }).catch((error) => { console.error(error); });
}

export function contact() {
    session.setItem("code", itemData.boatCode);
    wixLocation.to("/contact-boat-for-sale");
}