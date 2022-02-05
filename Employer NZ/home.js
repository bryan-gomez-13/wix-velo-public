import wixData from 'wix-data'
import wixLocation from 'wix-location';
import wixWindow from "wix-window";

import { eMail } from 'backend/email.jsw'

var make = [];
var city = [];

$w.onReady(function () {
    init();
    getDropDown();
});
// ================================================= I N I T =================================================
function init() {
    $w('#make').onChange(() => filter("Make"))
    $w('#model').onChange(() => filter("City"))
    $w('#search').onInput(() => filter("Search"))
    $w('#save').onClick(() => saveReview());
    $w("#seeMore").onClick((event) => {
        let $item = $w.at(event.context);
        let clickedItemData = $item("#dataset1").getCurrentItem();
        wixWindow.openLightbox('See More', {
            "item": clickedItemData
        })
    });
    $w('#listRepeater').onItemReady(() => descriptionShort())
    $w('#reviews').onClick(() => { $w('#statebox8').changeState('Reviews'), $w('#reviews').disable(), $w('#addReview').enable() })
    $w('#addReview').onClick(() => { $w('#statebox8').changeState('AddReviews'), $w('#addReview').disable(), $w('#reviews').enable() })
}

// ================================================= R E V I E W =================================================
// ================================================= GETDROP
export async function getDropDown() {
    let makeList = await wixData.query("Make").ascending("make").limit(1000).find().then();
    make = [{ "label": "All", "value": "All" }];
    await dropDownMake(makeList, make);
    while (makeList.hasNext()) {
        makeList = await makeList.next();
        dropDownMake(makeList, make);
    }

    let cityList = await wixData.query("Models").ascending("model").limit(1000).find().then();
    city = [{ "label": "All", "value": "All" }];
    await dropDownCity(cityList, city);
    while (cityList.hasNext()) {
        cityList = await cityList.next();
        dropDownMake(cityList, city);
    }
}
// ================================================= DROP COMPANY
export function dropDownMake(results, make) {
    if (results.items.length > 0) {
        for (let i = 0; i < results.items.length; i++) {
            make.push({ label: results.items[i].make, value: results.items[i].make })
        }
        $w('#make').options = make;
        $w('#make2').options = make;
    }
}
// ================================================= DROP CITY
export function dropDownCity(results, city) {
    if (results.items.length > 0) {
        for (let i = 0; i < results.items.length; i++) {
            city.push({ label: results.items[i].model, value: results.items[i].model })
        }
        $w('#model').options = city;
        $w('#model2').options = city;
    }
}
// ================================================= FILTER
function filter(Type) {
    let makeDrop = $w('#make').value;
    let cityDrop = $w('#model').value;
    let searchIT = $w('#search').value;
    console.log(makeDrop, 1, cityDrop, 2, searchIT, 3)

    var filter = wixData.filter()
    var f = wixData.filter();

    if (makeDrop !== 'All') {
        //console.log(1)
        filter = filter.and(f.eq("company", makeDrop));
    }
    if (cityDrop !== 'All') {
        //console.log(2)
        filter = filter.and(f.eq("location", cityDrop));
    }
    if (searchIT !== "" || searchIT !== null || searchIT !== undefined) {
        //console.log(3)
        filter = filter.and(f.contains("company", searchIT));
    }
    $w("#dataset1").setFilter(filter)
}
// ================================================= REVIEW TEXT
export function descriptionShort($item, itemData, index) {
    let size = 200;
    $w('#listRepeater').onItemReady(($employer, employer) => {
        if (employer.review.length > size) {
            $employer('#text35').text = `${employer.review.substr(0,size)}...`;
        }
    })
}

// ================================================= A D D - R E V I E W =================================================
async function saveReview() {
    $w('#text6').hide();
    $w('#text6').hide();

    try {

        await checkValidation();
        $w('#text6').hide();
        $w('#text5').show();

        let options = {
            "suppressAuth": true,
            "suppressHooks": true
        };

        let toSave = {
            "company": $w("#make2").value,
            "location": $w("#model2").value,
            "position": $w("#position").value,
            "startYear": $w("#startYear").value,
            "endYear": $w("#endYear").value,
            "review": $w("#reviewText").value,
            "active": false,
            "buttom": "See More"
        }

        await wixData.insert("Reviews", toSave, options)
            .then(async (results) => {
                toSave.id = results._id
                await eMail(toSave)
                reset();
                wixLocation.to("/")
                $w('#text5').hide();
            })
            .catch((err) => {
                let errorMsg = err;
                $w('#text5').hide();
                $w('#text6').show();
                console.log(err)
            });

        $w('#dataset1').refresh()

    } catch (err) {
        $w('#text6').text = err.message;
        $w('#text6').show();
    }
}

function checkValidation() {
    if (!($w('#make2').value !== "All")) throw new Error('Missing Company');
    if (!($w('#model2').value !== "All")) throw new Error('Missing Location');
    if (!$w('#startYear').valid) throw new Error('Missing Start Year');
    if (!$w('#endYear').valid) throw new Error('Missing End Year');
    if (!$w('#reviewText').valid) throw new Error('Missing Review');
}

function reset() {
    $w('#make2').selectedIndex = 0;
    $w('#model2').selectedIndex = 0;
    $w('#position').value = "";
    $w('#startYear').value = "";
    $w('#endYear').value = "";
    $w('#reviewText').value = "";
    $w('#statebox8').changeState('Reviews')
    $w('#addReview').enable();
    $w('#reviews').disable();
}