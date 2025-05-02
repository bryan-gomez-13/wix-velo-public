import { session } from 'wix-storage';
import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import { updateFavorite, updateCollection, getLocations } from 'backend/collections.web.js';
import { currentMember, authentication } from "wix-members-frontend";
// launch 553bfc97-8015-441c-a72a-2f61b09b6cca
// yacht 52a22af0-e352-4284-9120-184b4d8bee53 
var boatCheck = "",
    btMarina = false

let memberId, followSave = '';

let json = {
    type: '',
    marinaBerthMooring: false,
    fromP: 'Any',
    toP: 'Any',
    fromL: 'Any',
    toL: 'Any',
    location: 'All'
}

$w.onReady(async function () {
    await getLocations().then((locations) => {
        $w('#location').options = locations;
    })

    $w('#yacht').onClick(() => {
        json.type = (json.type === '52a22af0-e352-4284-9120-184b4d8bee53') ? '' : '52a22af0-e352-4284-9120-184b4d8bee53';
        json.marinaBerthMooring = false;
        filt();
    });
    $w('#imgYacht').onClick(() => {
        json.type = (json.type === '52a22af0-e352-4284-9120-184b4d8bee53') ? '' : '52a22af0-e352-4284-9120-184b4d8bee53';
        json.marinaBerthMooring = false;
        filt();
    });
    $w('#launch').onClick(() => {
        json.type = (json.type === '553bfc97-8015-441c-a72a-2f61b09b6cca') ? '' : '553bfc97-8015-441c-a72a-2f61b09b6cca';
        json.marinaBerthMooring = false;
        filt();
    });
    $w('#imgLaunch').onClick(() => {
        json.type = (json.type === '553bfc97-8015-441c-a72a-2f61b09b6cca') ? '' : '553bfc97-8015-441c-a72a-2f61b09b6cca';
        json.marinaBerthMooring = false;
        filt();
    });

    $w('#imgMarina').onClick(() => {
        json.marinaBerthMooring = !json.marinaBerthMooring;
        json.type = '';
        filt();
    });
    $w('#btMarina').onClick(() => {
        json.marinaBerthMooring = !json.marinaBerthMooring;
        json.type = '';
        filt();

    });

    $w('#location').onChange(() => { json.location = $w('#location').value, filt() });

    $w('#dynamicDataset').onReady(() => {
        $w('#group1').expand();
        $w('#boatFound').text = `${$w('#dynamicDataset').getTotalCount()} boats found`;
        $w('#boatFound').show();

        // If session exists, use it first (e.g., after redirect from another page)
        if (session.getItem('url')) {
            json = JSON.parse(session.getItem('url'));
            session.removeItem('url');

            // Actualiza la URL visible con los parámetros del json
            wixLocationFrontend.queryParams.add(json);

            // Set UI components and trigger filt()
            updateFieldsUrl();
        } else {
            // Read from URL directly
            const query = wixLocationFrontend.query;
            let change = false;

            if (query.fromL && query.fromL !== 'Any') json.fromL = query.fromL, change = true;
            if (query.toL && query.toL !== 'Any') json.toL = query.toL, change = true;

            if (query.fromP && query.fromP !== 'Any') json.fromP = query.fromP, change = true;
            if (query.toP && query.toP !== 'Any') json.toP = query.toP, change = true;

            if (query.location && query.location !== 'All' && query.location !== '') json.location = query.location, change = true;

            if (query.marinaBerthMooring === 'true') json.marinaBerthMooring = true, change = true;
            if (query.marinaBerthMooring === 'false') json.marinaBerthMooring = false, change = true;

            if (query.type && query.type !== '') json.type = query.type, change = true;

            if (change) {
                updateFieldsUrl();
            }
        }
    });

    //Get min max
    $w('#fromP').onChange(() => { json.fromP = $w('#fromP').value, filt() });
    $w('#toP').onChange(() => {
        json.toP = $w('#toP').value;
        if ($w('#toP').value !== "Any" && parseInt($w('#fromP').value) >= parseInt($w('#toP').value)) {
            $w('#toP').value = "Any";
            json.toP = $w('#toP').value;
            filt();
        } else filt();
    })

    $w('#fromL').onChange(() => { json.fromL = $w('#fromL').value, filt() });
    $w('#toL').onChange(() => {
        json.toL = $w('#toL').value;
        if ($w('#toL').value !== "Any" && parseInt($w('#fromL').value) >= parseInt($w('#toL').value)) {
            $w('#toL').value = "Any";
            json.toL = $w('#toL').value;
            filt();
        } else filt();
    })

    await getMember();
    authentication.onLogin(async () => {
        getMember();
        $w('#dynamicDataset').refresh();
    });

    $w('#contact').onClick((event) => contact(event));
    updateRepeater();
})

// ======================================================================== URL Filter
function updateFieldsUrl() {
    if (json.fromP && json.fromP !== 'Any') $w('#fromP').value = json.fromP;
    if (json.toP && json.toP !== 'Any') $w('#toP').value = json.toP;

    if (json.fromL && json.fromL !== 'Any') $w('#fromL').value = json.fromL;
    if (json.toL && json.toL !== 'Any') $w('#toL').value = json.toL;

    if (json.location && json.location !== "All" && json.location !== "") $w('#location').value = json.location;

    // Reflejar selección visual de tipo
    updateTypeVisuals();

    filt();

}

function updateTypeVisuals() {
    const yachtID = '52a22af0-e352-4284-9120-184b4d8bee53';
    const launchID = '553bfc97-8015-441c-a72a-2f61b09b6cca';

    // Reset all styles
    $w("#yacht, #launch, #btMarina").style.backgroundColor = "#0BAED3";
    $w("#yacht, #launch, #btMarina").style.color = "#FFFFFF";
    $w("#box5, #box6, #box7").style.backgroundColor = "#FFFFFF";

    if (json.type === yachtID) {
        $w("#yacht").style.backgroundColor = "#FFFFFF";
        $w("#yacht").style.color = "#0BAED3";
        $w("#box5").style.backgroundColor = "#0BAED3";
    } else if (json.type === launchID) {
        $w("#launch").style.backgroundColor = "#FFFFFF";
        $w("#launch").style.color = "#0BAED3";
        $w("#box6").style.backgroundColor = "#0BAED3";
    } else if (json.marinaBerthMooring === true) {
        $w("#btMarina").style.backgroundColor = "#FFFFFF";
        $w("#btMarina").style.color = "#0BAED3";
        $w("#box7").style.backgroundColor = "#0BAED3";
    }
}

// ========================================================================
function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] })
        .then(async (member) => {
            if (member) memberId = member._id;
            updateRepeater();
            //$w('#btFavorite').expand();
        })
        .catch((error) => { console.error(error); });
}

function updateRepeater() {
    $w('#listRepeater').onItemReady(async ($item, itemData, index) => {
        if (memberId) {
            const itemBoat = await updateFavorite('BoatsForSale2', '_id', itemData._id, 'favorite', memberId, false);
            if (itemBoat.items.length > 0) {
                //$item('#btFavorite').style.backgroundColor = "#0BAED3";
                $item('#btFavorite').label = "Unfollow";
            }
        }

        $item('#title').onClick(() => wixLocationFrontend.to(itemData['link-boats-for-sale2-title']))

        if (followSave == itemData._id) {
            followSave = '';
            const itemFavorite = await updateFavorite('BoatsForSale2', '_id', itemData._id, 'favorite', memberId, true);
            if (itemFavorite) {
                //$item('#btFavorite').style.backgroundColor = "#E21C21";
                $item('#btFavorite').label = "Add to Watchlist";
            } else {
                //$item('#btFavorite').style.backgroundColor = "#0BAED3";
                $item('#btFavorite').label = "Unfollow";
            }
        }

        $item('#btFavorite').onClick(async () => {
            if (memberId) {
                const itemFavorite = await updateFavorite('BoatsForSale2', '_id', itemData._id, 'favorite', memberId, true);
                if (itemFavorite) {
                    //$item('#btFavorite').style.backgroundColor = "#E21C21";
                    $item('#btFavorite').label = "Add to Watchlist";
                } else {
                    //$item('#btFavorite').style.backgroundColor = "#0BAED3";
                    $item('#btFavorite').label = "Unfollow";
                }
            } else {
                followSave = itemData._id
                authentication
                    .promptLogin({ mode: 'login', modal: true })
                    .then(() => { console.log("Member is logged in") })
                    .catch((error) => { console.error(error) });
            }
        })
    })
}

function filt() {
    let filter = wixData.filter();

    // Reset all styles
    $w("#yacht").style.backgroundColor = "#0BAED3";
    $w("#yacht").style.color = "#FFFFFF";
    $w("#box5").style.backgroundColor = "#FFFFFF";

    $w("#launch").style.backgroundColor = "#0BAED3";
    $w("#launch").style.color = "#FFFFFF";
    $w("#box6").style.backgroundColor = "#FFFFFF";

    $w("#btMarina").style.backgroundColor = "#0BAED3";
    $w("#btMarina").style.color = "#FFFFFF";
    $w("#box7").style.backgroundColor = "#FFFFFF";

    // Apply visual style and filters by type
    if (json.type === "52a22af0-e352-4284-9120-184b4d8bee53") {
        $w("#yacht").style.backgroundColor = "#FFFFFF";
        $w("#yacht").style.color = "#0BAED3";
        $w("#box5").style.backgroundColor = "#0BAED3";

        filter = filter.and(wixData.filter().eq("type", json.type));
    } else if (json.type === "553bfc97-8015-441c-a72a-2f61b09b6cca") {
        $w("#launch").style.backgroundColor = "#FFFFFF";
        $w("#launch").style.color = "#0BAED3";
        $w("#box6").style.backgroundColor = "#0BAED3";

        filter = filter.and(wixData.filter().eq("type", json.type));
    } else if (json.marinaBerthMooring) {
        $w("#btMarina").style.backgroundColor = "#FFFFFF";
        $w("#btMarina").style.color = "#0BAED3";
        $w("#box7").style.backgroundColor = "#0BAED3";

        filter = filter.and(wixData.filter().eq("marinaBerthMooring", json.marinaBerthMooring));
    }

    // Price
    if (json.fromP !== "Any") filter = filter.and(wixData.filter().ge("price", parseInt(json.fromP)));
    if (json.toP !== "Any") filter = filter.and(wixData.filter().le("price", parseInt(json.toP)));

    // Lenght
    if (json.fromL !== "Any") filter = filter.and(wixData.filter().ge("vesselLength", parseInt(json.fromL)));
    if (json.toL !== "Any") filter = filter.and(wixData.filter().le("vesselLength", parseInt(json.toL)));

    // Location
    if (json.location !== "All" && json.location !== "") filter = filter.and(wixData.filter().eq("location", json.location));

    $w('#dynamicDataset').setFilter(filter).then(() => {
        $w('#dynamicDataset').onReady(() => {
            if ($w('#dynamicDataset').getTotalCount() == 0) $w('#message').expand(), $w('#listRepeater').collapse(), $w('#btLoad').collapse();
            else $w('#message').collapse(), $w('#listRepeater').expand(), $w('#btLoad').expand();

            $w('#boatFound').text = `${$w('#dynamicDataset').getTotalCount()} boats found`;
            $w('#boatFound').show();
        })
    });

    addToUrl();
}

function addToUrl() {
    wixLocationFrontend.queryParams.add(json)
    session.setItem("url", JSON.stringify(json));
}

function contact(event) {
    let $item = $w.at(event.context);
    let clickedItemData = $item("#dynamicDataset").getCurrentItem();
    session.setItem("code", clickedItemData.boatCode);
    wixLocationFrontend.to("/contact-boat-for-sale");
}