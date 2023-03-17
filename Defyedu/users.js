import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { currentMember } from 'wix-members';
//array
var arrayRole, array;
var premium = false;

//option2
var arrayStates, arrayCity, arrayRep = []

$w.onReady(function () {
    init();
    drop();

});

function init() {
    $w('#filter').onChange(async () => {
        $w('#state').value = ''
        $w('#city').value = ''
        $w('#state').disable();
        $w('#city').disable();
        await filter(false)
        if (premium && ($w('#filter').value !== 'All' || $w('#filter').value !== '')) await getState();
    });
    $w('#state').onChange(async () => {
        $w('#city').value = ''
        $w('#city').disable();
        filter(false)
        if (premium && ($w('#state').value !== 'All' || $w('#filter').value !== '')) await getCity();
    });
    $w('#city').onChange(() => filter(false));

    $w('#clear').onClick(() => clear())

    // OP2
    $w('#op2Filter').onClick(() => {
        wixWindow.openLightbox("Filter", {
                "filter": array,
                "rep": arrayRep,
                "premium": premium
            })
            .then((data) => {
                //console.log('gello')
                if (data.rep) {
                    arrayRep = data.rep
                    //console.log(arrayRep)
                    updateRep();
                    filterOp2();
                }
            });
    })
}

// ============================================== DROP ==============================================
async function drop() {
    /*
    await wixData.query('States').ascending('state').find().then((results) => {
        let array = [{ label: "All", value: "All" }]
        for (let i = 0; i < results.items.length; i++) {
            array.push({ label: results.items[i].state, value: results.items[i]._id })
        }
        $w('#state').options = array
        //$w('#state').enable();
    })
    

    await wixData.query('users').ascending('city').hasSome('role', ["College Student", "College Graduate", "Counselor"]).find().then((results) => {
        let array = [{ label: "All", value: "All" }]
        let arrayO = getCS(results.items, 'city')
        for (let i = 0; i < arrayO.length; i++) {
            array.push({ label: arrayO[i], value: arrayO[i] })
        }
        $w('#city').options = array
        //$w('#city').enable();
    })
    */

    await currentMember.getRoles()
        .then(async (roles) => {
            if (roles.length > 0) {
                premium = true
                await role(roles[0].title)
                //$w('#state').enable();
                //$w('#city').enable();
            } else {
                currentMember.getMember().then((member) => {
                    wixData.query("users").eq('privateId', member._id).find()
                        .then((results) => {
                            if (results.items.length > 0) role(results.items[0].role, results.items[0].premium)
                        }).catch((err) => console.log(err));
                }).catch((error) => console.error(error));
            }
        }).catch((error) => console.error(error));

}

// ============================================== GET ROLE ==============================================
async function role(role, premium) {
    if ((role == "High School Student" && !(premium)) || role == "Parents" || role == "College Student" || role == "College Graduate" || role == "Counselor") {
        array = [{ label: "All", value: "All" },
            { label: "High School Student", value: "High School Student" },
            { label: "Parents", value: "Parents" },
            { label: "College Student", value: "College Student" },
            { label: "College Graduate", value: "College Graduate" },
            { label: "Counselor", value: "Counselor" }
        ]
        arrayRole = ["High School Student", "Parents", "College Student", "College Graduate", "Counselor"]
        await filter(true, arrayRole)
    } else if (role == "Sponsor") {
        array = [{ label: "All", value: "All" },
            { label: "High School Student", value: "High School Student" },
            { label: "Parents", value: "Parents" }
        ]
        arrayRole = ["High School Student", "Parents"]
        await filter(true, arrayRole)
    } else if (role == "High School Student" && premium) {
        array = [{ label: "All", value: "All" },
            { label: "College Student", value: "College Student" },
            { label: "College Graduate", value: "College Graduate" },
            { label: "Counselor", value: "Counselor" }
        ]
        arrayRole = ["College Student", "College Graduate", "Counselor"]
        await filter(true, arrayRole)
    }
    $w('#filter').options = array
    $w('#filter').enable();
}

// ============================================== FILTER ==============================================
function filter(option, value) {
    $w('#listRepeater').hide();
    $w('#loading').show();
    let filter = wixData.filter();

    if (option) {
        filter = filter.and(wixData.filter().hasSome("role", value));
    } else {
        if (($w('#filter').value !== "All" || $w('#filter').value !== '') && $w('#filter').value !== "") filter = filter.and(wixData.filter().eq("role", $w('#filter').value));
        else filter = filter.and(wixData.filter().hasSome("role", arrayRole));

        if (($w('#state').value !== "All" || $w('#filter').value !== '') && $w('#state').value !== "") filter = filter.and(wixData.filter().eq("state", $w('#state').value));

        if (($w('#city').value !== "All" || $w('#filter').value !== '') && $w('#city').value !== "") filter = filter.and(wixData.filter().eq("city", $w('#city').value));
    }

    $w('#dynamicDataset').setFilter(filter).then(() => {
        $w('#dynamicDataset').onReady(() => {
            $w('#loading').hide();
            $w('#listRepeater').show();
        })
    });
}

// ============================================== GET STATE ==============================================
async function getState() {
    await wixData.query('users').ascending('state').hasSome('role', $w('#filter').value).find().then(async (results) => {
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
    })
}

// ============================================== GET CITY ==============================================
async function getCity() {
    let wixFilter = wixData.query('users')
    await wixFilter.eq('state', $w('#state').value).and(wixFilter.eq('role', $w('#filter').value)).ascending('city').find().then((results) => {
        let array = [{ label: "All", value: "All" }]
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
        if (!(arrayReturn.includes(array[i][filt]))) arrayReturn.push(array[i][filt])
    }
    return arrayReturn
}

// ============================================== CLEAR ==============================================
async function clear() {
    $w('#state').value = ''
    $w('#city').value = ''
    $w('#filter').value = ''
    $w('#state').disable();
    $w('#city').disable();
    await filter(true, arrayRole)
    $w('#filter').options = array
}

// ============================================================================================ OP2 ============================================================================================
function filterOp2() {
    $w('#listRepeater').hide();
    $w('#loading').show();
    let filter = wixData.filter();

    const category = {};

    arrayRep.forEach(item => {
        if (!category[item.kind]) {
            category[item.kind] = [];
        }
        category[item.kind].push(item.value);
    });

    let catFilter = []
    if (category["Filter"]) catFilter = category["Filter"];
    let cateState = []
    if (category["State"]) cateState = category["State"];
    let cateCity = []
    if (category["City"]) cateCity = category["City"];

    if (catFilter.length > 0) filter = filter.or(wixData.filter().hasSome("role", catFilter));
    if (cateState.length > 0) filter = filter.or(wixData.filter().hasSome("state", cateState));
    if (cateCity.length > 0) filter = filter.or(wixData.filter().hasSome("city", cateCity));

    $w('#dynamicDataset').setFilter(filter).then(() => {
        $w('#dynamicDataset').onReady(() => {
            $w('#loading').hide();
            $w('#listRepeater').show();
        })
    });

}

function updateRep() {
    $w('#repOp2').data = arrayRep;
    $w("#repOp2").forEachItem(($item, itemData, index) => {
        if (itemData.kind == "State") $item("#textOp2").text = itemData.state;
        else $item("#textOp2").text = itemData.value;
        $item("#clearOp2").onClick(async () => {
            await remove(itemData)
            await filterOp2();
        });
    });
    $w("#repOp2").expand();
}

async function remove(itemData) {
    for (let i = 0; i < arrayRep.length; i++) {
        if (arrayRep[i]._id == itemData._id && arrayRep[i].sku == itemData.sku) {
            arrayRep.splice(i, 1);
            await updateRep();
            break;
        }
    }
    if (arrayRep.length == 0) $w('#repOp2').collapse();
}