import wixWindow from 'wix-window';
import wixData from 'wix-data';
var arrayRep = [],
    premium

$w.onReady(function () {
    init();
    getInfo();
});

function getInfo() {
    let received = wixWindow.lightbox.getContext();
    $w('#filter').options = received.filter;
    arrayRep = received.rep;
    premium = received.premium
    if (arrayRep.length > 0) updateMulti()
}

function init() {
    // filter
    $w('#filter').onChange(() => {
        Repeter();
        if (premium) getState();
    })
    $w('#state').onChange(() => {
        getCity();
        Repeter();
    })
    $w('#city').onChange(() => {
        Repeter();
    })
    //Buttons
    $w('#clear').onClick(() => {
        $w('#filter').value = []
        $w('#state').options = [{label:'Filter By',value: ''}]
        $w('#city').options = [{label:'Filter By',value: ''}]
        $w('#state').value = []
        $w('#city').value = []
        
        $w('#state').disable()
        $w('#city').disable()
    })

    $w('#apply').onClick(() => {
        wixWindow.lightbox.close({
            rep: arrayRep
        });
    })
}

// ============================================== ARRAY REP ==============================================
async function Repeter() {
    $w('#apply').disable();
    arrayRep = [];
    if ($w('#filter').value.length > 0) {
        for (let i = 0; i < $w('#filter').value.length; i++) {
            let json = {
                "_id": arrayRep.length + "",
                "kind": "Filter",
                "value": $w('#filter').value[i]
            }
            arrayRep.push(json)
        }
    }
    if ($w('#state').options.length > 0) {
        if ($w('#state').value.length > 0) {
            for (let i = 0; i < $w('#state').value.length; i++) {
                let stateN = await wixData.query('States').eq('_id', $w('#state').value[i]).find().then((rState) => { return rState.items[0].state })
                //console.log(stateN)
                let json = {
                    "_id": arrayRep.length + "",
                    "kind": "State",
                    "state": stateN,
                    "value": $w('#state').value[i]
                }
                arrayRep.push(json)
            }
        }
    }
    if ($w('#city').options.length > 0) {
        if ($w('#city').value.length > 0) {
            for (let i = 0; i < $w('#city').value.length; i++) {
                let json = {
                    "_id": arrayRep.length + "",
                    "kind": "City",
                    "value": $w('#city').value[i]
                }
                arrayRep.push(json)
            }
        }
    }
    $w('#apply').enable();
    //console.log(arrayRep)
}

// ============================================== GET STATE ==============================================
async function getState() {
    await wixData.query('users').ascending('state').hasSome('role', $w('#filter').value).find().then(async (results) => {
        //console.log(results)
        let arrayS = []
        let array = [ /*{ label: "All", value: "All" }*/ ]
        for (let i = 0; i < results.items.length; i++) {
            if (!(arrayS.includes(results.items[i]['state']))) {
                let name = await wixData.query('States').eq('_id', results.items[i].state).find().then((rState) => { return rState.items[0].state })
                arrayS.push(results.items[i].state)
                array.push({ label: name, value: results.items[i].state })
            }
        }
        $w('#state').options = array
        $w('#state').enable();
    }).catch((err) => console.log(err))
}

// ============================================== GET CITY ==============================================
async function getCity() {
    let wixFilter = wixData.query('users')
    await wixFilter.hasSome('state', $w('#state').value).and(wixFilter.hasSome('role', $w('#filter').value)).ascending('city').find().then((results) => {
        let array = [ /*{ label: "All", value: "All" }*/ ]
        let arrayO = getCS(results.items, 'city')
        for (let i = 0; i < arrayO.length; i++) {
            array.push({ label: arrayO[i], value: arrayO[i] })
        }
        $w('#city').options = array
        $w('#city').enable();
    })
}

// ============================================== GET ARRAY CS ==============================================
function getCS(array, filt) {
    let arrayReturn = []
    for (let i = 0; i < array.length; i++) {
        if (!(arrayReturn.includes(array[i][filt])) && array[i][filt] !== '') arrayReturn.push(array[i][filt])
    }
    return arrayReturn
}

// ============================================== GET MULTI ==============================================
async function updateMulti() {
    const category = {};

    arrayRep.forEach(item => {
        if (!category[item.kind]) {
            category[item.kind] = [];
        }
        category[item.kind].push(item.value);
    });

    let catFilter = []
    if (category["Filter"]) {
        catFilter = category["Filter"]
        $w('#filter').value = catFilter
        if (premium) getState();
    }
    let cateState = []
    if (category["State"]) cateState = category["State"];
    let cateCity = []
    if (category["City"]) cateCity = category["City"];

    await Repeter();
}