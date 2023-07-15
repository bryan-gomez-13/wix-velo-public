import wixWindow from 'wix-window';
import wixData from 'wix-data';
var arrayRep = [],
    premium, stateAllB, cityAllB

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
        if (premium) {
            $w('#premiumTxT').collapse();
            getState();
        }else $w('#premiumTxT').expand();
    })
    $w('#state').onChange(async () => {
        await stateAll();
        getCity();
        Repeter();
    })
    $w('#city').onChange(async () => {
        await cityAll();
        if ($w('#city').value.includes('All')) console.log('All')
        Repeter();
    })
    //Buttons
    $w('#clear').onClick(() => {
        $w('#filter').value = []
        $w('#state').options = [{ label: 'Filter By', value: '' }]
        $w('#city').options = [{ label: 'Filter By', value: '' }]
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
        let state = $w('#state').value;
        if (state.includes('All')) state.shift();
        if (state.length > 0) {
            for (let i = 0; i < state.length; i++) {
                //let stateN = await wixData.query('States').eq('_id', $w('#state').value[i]).find().then((rState) => { return rState.items[0].state })
                //console.log(stateN)
                let json = {
                    "_id": arrayRep.length + "",
                    "kind": "State",
                    "state": state[i],
                    "value": state[i]
                }
                arrayRep.push(json)
            }
        }
    }
    if ($w('#city').options.length > 0) {
        let city = $w('#city').value;
        if (city.includes('All')) city.shift();
        if (city.length > 0) {
            for (let i = 0; i < city.length; i++) {
                let json = {
                    "_id": arrayRep.length + "",
                    "kind": "City",
                    "value": city[i]
                }
                arrayRep.push(json)
            }
        }
    }
    $w('#apply').enable();
    //console.log(arrayRep)
}

// ============================================== STATE ==============================================
async function getState() {
    await wixData.query('users').ascending('state').hasSome('role', $w('#filter').value).find().then(async (results) => {
        if (results.items.length > 0) {
            console.log(results.items)
            let arrayS = []
            let array = [{ label: "All", value: "All" }]
            for (let i = 0; i < results.items.length; i++) {

                if (!(arrayS.includes(results.items[i]['stateV']))) {
                    console.log(results.items[i].stateV)
                    //let name = await wixData.query('States').eq('_id', results.items[i].state).find().then((rState) => { return rState.items[0].state })
                    arrayS.push(results.items[i].stateV)
                    array.push({ label: results.items[i].stateV, value: results.items[i].stateV })
                }
            }
            $w('#state').options = array
            $w('#state').enable();
        } else {
            $w('#state').options = [{ label: 'Filter By', value: '' }]
            $w('#state').disable();
        }

    }).catch((err) => console.log(err))
}

function stateAll() {
    if ($w('#state').value.includes('All')) {
        let stateV = []
        stateAllB = true
        $w('#state').options.forEach(states => {
            stateV.push(states.value)
        })
        $w('#state').value = stateV;
    } else if (stateAllB) {
        $w('#state').value = [];
        stateAllB = false;
        $w('#city').options = [{ label: 'Filter By', value: '' }]
        $w('#city').disable();
    }
}

// ============================================== GET CITY ==============================================
async function getCity() {
    let wixFilter = wixData.query('users')
    let state = $w('#state').value
    if (state.includes('All')) state.shift();

    await wixFilter.hasSome('stateV', state).and(wixFilter.hasSome('role', $w('#filter').value)).ascending('city').find().then((results) => {
        if (results.items.length > 0) {
            let array = [{ label: "All", value: "All" }]
            let arrayO = getCS(results.items, 'city')
            for (let i = 0; i < arrayO.length; i++) {
                array.push({ label: arrayO[i], value: arrayO[i] })
            }
            $w('#city').options = array
            $w('#city').enable();
        }
    })
}

function cityAll() {
    if ($w('#city').value.includes('All')) {
        let cityV = []
        cityAllB = true
        $w('#city').options.forEach(city => {
            cityV.push(city.value)
        })
        $w('#city').value = cityV;
    } else if (cityAllB) {
        $w('#city').value = [];
        cityAllB = false;
    }
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
        console.log(premium)
        if (premium) getState();
    }
    let cateState = []
    if (category["State"]) cateState = category["State"];
    let cateCity = []
    if (category["City"]) cateCity = category["City"];

    await Repeter();
}