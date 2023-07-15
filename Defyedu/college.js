import wixWindow from 'wix-window';
import wixData from 'wix-data';
var arrayRep = []

$w.onReady(function () {
    init();
    okRep();
});

function init() {
    $w('#btFilter').onClick(() => {
        wixWindow.openLightbox("Filter College", {
                "filter": arrayRep
            })
            .then(async (data) => {
                if (data !== null && data.filter) {
                    arrayRep = data.filter
                    await repFilter();
                    await filter();
                }
            });
    })
}

// ============================================================================================ REP FILTER ============================================================================================
function filter() {
    $w('#repCollege').hide();
    $w('#loading').show();

    let filter = wixData.filter();

    const category = {};

    console.log("arrayRep", arrayRep)

    arrayRep.forEach(item => {
        if (!category[item.kind]) {
            category[item.kind] = [];
        }
        category[item.kind].push(item.value);
    });

    console.log("category", category)

    if (category["Institution"]) filter = filter.and(wixData.filter().eq("typeOfInstitution", category["Institution"][0]));
    if (category["State"]) filter = filter.and(wixData.filter().hasSome("state", category["State"]));
    if (category["City"]) filter = filter.and(wixData.filter().hasSome("city", category["City"]));
    if (category["Type"]) filter = filter.and(wixData.filter().eq("type", category["Type"][0]));
    if (category["top100"]) filter = filter.and(wixData.filter().le("usNationalRanking", 100));
    if (category["campusHousing"]) filter = filter.and(wixData.filter().eq("onCampusHousing", category["campusHousing"][0]));
    if (category["totalTuitionFees"]) {
        if (category["totalTuitionFees"][0] == "Higher than $10000") filter = filter.and(wixData.filter().gt("inStateTuitionFees", 10000));
        else filter = filter.and(wixData.filter().le("inStateTuitionFees", 10000));
    }

    $w('#dataCollege').setFilter(filter).then(() => {
        $w('#dataCollege').onReady(async () => {
            await okRep()
            $w('#loading').hide();
            $w('#repCollege').show();
        })
    });

}

function repFilter() {
    $w('#repOp2').data = arrayRep;
    $w("#repOp2").onItemReady(($item, itemData, index) => {
        if (itemData.kind == "State") $item("#textOp2").text = itemData.state;
        else $item("#textOp2").text = itemData.value;
        $item("#clearOp2").onClick(async () => {
            await remove(itemData)
            await filter();
        });
    });
    $w("#repOp2").expand();
}

async function remove(itemData) {
    for (let i = 0; i < arrayRep.length; i++) {
        if (arrayRep[i]._id == itemData._id && arrayRep[i].sku == itemData.sku) {
            arrayRep.splice(i, 1);
            await repFilter();
            break;
        }
    }
    if (arrayRep.length == 0) $w('#repOp2').collapse();
}

// ============================================================================================ REP ============================================================================================
function okRep() {
    $w('#dataCollege').onReady(() => {
        $w('#repCollege').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            let city, state, value = false
            if ($item('#city').text !== 'City') city = $item('#city').text + " ", value = true
            if ($item('#state').text !== 'State') state = $item('#state').text, value = true
            if (value) $item('#cityState').text = city + state, $item('#cityState').show();

            $item('#tuition').text = "$" + itemData.inStateTuitionFees
            $item('#tuition').show();

            $item('#totalCost').text = "$" + itemData.inStateTotalExpenses
            $item('#totalCost').show();

        })
    })
}