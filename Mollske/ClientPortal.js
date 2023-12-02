import { currentMember } from 'wix-members-frontend';
import wixData from 'wix-data';

import { getCollections } from 'backend/collections.jsw'
var filt = []
$w.onReady(function () {
    currentMember.getRoles().then(async (roles) => {
        if (roles.length > 1 || roles[0]._id == "555f41cb-3c07-49ed-ab0e-c43ee0592158") {
            let filtC = []
            for (let i = 0; i < roles.length; i++) {
                filtC.push(roles[i]._id)
            }
            let collections = await getCollections(filtC);
            $w('#filtHotels').data = collections;
            $w('#filtHotels').onItemReady(($item, itemData, index) => {
                $item('#image').src = itemData.imageCategory;
                $item('#image').alt = itemData.name;
                $item('#image').tooltip = itemData.name;
                $item('#filtName').label = itemData.name;
                $item('#filtName').onClick(async () => {
                    let x = await preFilt(itemData);
                    if (x) $item('#filtName').style.backgroundColor = "#FFFFFF", $item('#filtName').style.color = "#7A8C8C";
                    else $item('#filtName').style.backgroundColor = "#7A8C8C", $item('#filtName').style.color = "#FFFFFF";
                });
            });
            $w('#filtHotels').expand();
            $w('#filterBy').expand();
        } else {
            $w('#filterBy').collapse();
            let collections = await getCollections([roles[0]._id]);
            $w('#filtHotels').data = collections;
            $w('#filtHotels').onItemReady(($item, itemData, index) => {
                $item('#image').src = itemData.imageCategory;
                $item('#image').alt = itemData.name;
                $item('#image').tooltip = itemData.name;
                $item('#filtName').label = itemData.name;
            });
            $w('#filtName').disable();
            $w('#filtHotels').expand();
            filter([collections[0]._id]);
        }
    }).catch((error) => console.error(error));
});

function preFilt(itemData) {
    if (filt.includes(itemData._id)) {
        filt = filt.filter(element => element !== itemData._id);
        filter(filt);
        return false;
    } else {
        filt.push(itemData._id);
        filter(filt);
        return true;
    }
}

function filter(role) {
    $w('#repProducts').collapse();
    let filter = wixData.filter();
    if (role.length > 0) {
        filter = filter.and(wixData.filter().hasSome("collections", role));
        $w("#store").setFilter(filter);
        $w('#repProducts').scrollTo();
        $w('#repProducts').expand();
        $w('#button1').expand();
    } else {
        $w('#section1').scrollTo();
        $w('#repProducts').collapse();
        $w('#button1').collapse();
    }
}