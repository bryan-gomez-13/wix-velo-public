import wixWindow from 'wix-window';
import wixData from 'wix-data';
var arrayRep = [],
    stateAllB, cityAllB

$w.onReady(function () {
    init();
    getInfo();
});

async function getInfo() {
    let received = wixWindow.lightbox.getContext();
    arrayRep = received.filter;
    //console.log(arrayRep)
    await getState();
    if (arrayRep.length > 0) updateInfo();
}

function init() {
    $w('#state').onChange(async () => {
        await stateAll();
        getCity();
        filter();
    })
    $w('#city').onChange(async () => {
        await cityAll();
        filter();
    })

    $w('#typeInstitution').onChange(() => filter())
    $w('#type').onChange(() => filter())
    $w('#top100').onChange(() => filter())
    $w('#campusHousing').onChange(() => filter())
    $w('#totalTuitionFees').onChange(() => filter())

    //Buttons
    $w('#clear').onClick(() => {
        arrayRep = [];
        $w('#state').value = []

        $w('#city').options = [{ label: 'Filter By', value: '' }]
        $w('#city').value = []
        $w('#city').disable()

        $w('#typeInstitution').value = ""
        $w('#type').value = ""
        $w('#top100').value = ""
        $w('#campusHousing').value = ""
        $w('#totalTuitionFees').value = ""
    })

    $w('#apply').onClick(() => {
        //console.log(arrayRep)
        wixWindow.lightbox.close({
            filter: arrayRep
        });
    })
}

// ============================================== STATE ==============================================
async function getState() {
    await wixData.query('College').find().then(async (results) => {
        if (results.items.length > 0) {
            let arrayS = []
            let array = [{ label: "All", value: "All" }]
            for (let i = 0; i < results.items.length; i++) {
                if (!(arrayS.includes(results.items[i]['state']))) {
                    let name = await wixData.query('States').eq('_id', results.items[i].state).find().then((rState) => { return rState.items[0].state })
                    arrayS.push(results.items[i].state)
                    array.push({ label: name, value: results.items[i].state })
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
    let wixFilter = wixData.query('College')
    let state = $w('#state').value
    if (state.includes('All')) state.shift();

    await wixFilter.hasSome('state', state).ascending('city').find().then((results) => {
        if (results.items.length > 0) {
            let arrayC = [];
            let array = [{ label: "All", value: "All" }]
            for (let i = 0; i < results.items.length; i++) {
                if (!(arrayC.includes(results.items[i]["city"])) && results.items[i]["city"] !== '') {
                    arrayC.push(results.items[i].city)
                    array.push({ label: results.items[i].city, value: results.items[i].city })
                }
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

// ============================================== ARRAY REP ==============================================
async function filter() {
    $w('#apply').disable();
    arrayRep = [];

    if ($w('#typeInstitution').value !== '') {
        let json = {
            "_id": arrayRep.length + "",
            "kind": "Institution",
            "value": $w('#typeInstitution').value
        }
        arrayRep.push(json)
    }

    if ($w('#state').options.length > 0) {
        let state = $w('#state').value;
        if (state.includes('All')) state.shift();
        if (state.length > 0) {
            for (let i = 0; i < state.length; i++) {
                let stateN = await wixData.query('States').eq('_id', state[i]).find().then((rState) => { return rState.items[0].state })
                //console.log(stateN)
                let json = {
                    "_id": arrayRep.length + "",
                    "kind": "State",
                    "state": stateN,
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

    if ($w('#type').value !== '') {
        let json = {
            "_id": arrayRep.length + "",
            "kind": "Type",
            "value": $w('#type').value
        }
        arrayRep.push(json)
    }

    if ($w('#top100').checked) {
        let json = {
            "_id": arrayRep.length + "",
            "kind": "top100",
            "value": "Top 100"
        }
        arrayRep.push(json)
    }

    if ($w('#campusHousing').value !== '') {
        let json = {
            "_id": arrayRep.length + "",
            "kind": "campusHousing",
            "value": $w('#campusHousing').value
        }
        arrayRep.push(json)
    }

    if ($w('#totalTuitionFees').value !== '') {
        let json = {
            "_id": arrayRep.length + "",
            "kind": "totalTuitionFees",
            "value": $w('#totalTuitionFees').value
        }
        arrayRep.push(json)
    }

    $w('#apply').enable();
}

// ============================================== GET MULTI ==============================================
async function updateInfo() {
    const category = {};

    arrayRep.forEach(item => {
        if (!category[item.kind]) {
            category[item.kind] = [];
        }
        category[item.kind].push(item.value);
    });
    console.log(category)

    // INSTITUTE
    if (category["Institution"]) $w('#typeInstitution').value = category["Institution"][0];
    // STATE
    let cateState = []
    if (category["State"]) {
        cateState = category["State"];
        $w('#state').value = cateState;
        await getCity();
    }

    //CITY
    let cateCity = []
    if (category["City"]) {
        cateCity = category["City"];
        $w('#city').value = cateCity;
    }
    // TYPE
    if (category["Type"]) $w('#type').value = category["Type"][0];
    // TOP 100
    if (category["top100"]) $w('#top100').checked = true;
    // CAMPUS HOUSING
    if (category["campusHousing"]) $w('#campusHousing').value = category["campusHousing"][0];
    //TOTAL TUITION FEES
    if (category["totalTuitionFees"]) $w('#totalTuitionFees').value = category["totalTuitionFees"][0];

    await filter();
}