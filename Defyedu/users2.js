import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { session } from 'wix-storage';
import { currentMember } from 'wix-members';
//array
var arrayRole, array, roleS = true;
var premium = false;

var arrayRep = []

$w.onReady(async function () {
    await init();
    await drop();
    if (session.getItem("filter")) {
        $w('#dynamicDataset').onReady(async () => {
            if (roleS) {
                let arrayF = session.getItem("filter").split('-')
                for (let i = 0; i < arrayF.length; i++) { arrayRep.push({ "_id": i + "", "kind": "Filter", "value": arrayF[i] }) }
                await updateRep();
                await filterOp2();
                session.clear();
            } else {
                $w('#title').text = "You can't filter by mentors"
                setTimeout(() => $w('#title').text = "Users", 7000);
                session.clear();
            }

        })
    }
});

function init() {
    $w('#filterS').onClick(() => {
        wixWindow.openLightbox("Filter", {
                "filter": array,
                "rep": arrayRep,
                "premium": premium
            })
            .then((data) => {
                if (data.rep) {
                    arrayRep = data.rep
                    //console.log(arrayRep)
                    updateRep();
                    filterOp2();
                }
            });
    })

    okRep()
}

// ============================================== DROP ==============================================
async function drop() {
    await currentMember.getRoles()
        .then(async (roles) => {
            if (roles.length > 0) {
                premium = true
                //console.log(roles)
                if (roles[0].title == "Sponsor") roleS = false
                await role(roles[0].title, premium)
                //$w('#state').enable();
                //$w('#city').enable();
            } else {
                currentMember.getMember().then((member) => {
                    wixData.query("users").eq('privateId', member._id).find()
                        .then((results) => {
                            if (results.items.length > 0) role(results.items[0].role)
                        }).catch((err) => console.log(err));
                }).catch((error) => console.error(error));
            }
        }).catch((error) => console.error(error));

}

// ============================================== GET ROLE ==============================================
async function role(role, premium) {
    //console.log(role)
    if ((role == "High School Student" && !(premium)) || role == "Parents" || role == "College Student" || role == "College Graduate" || role == "Counselor") {
        array = [
            { label: "High School Student", value: "High School Student" },
            { label: "Parents", value: "Parents" },
            { label: "College Student", value: "College Student" },
            { label: "College Graduate", value: "College Graduate" },
            { label: "Counselor", value: "Counselor" }
        ]
        arrayRole = ["High School Student", "Parents", "College Student", "College Graduate", "Counselor"]
        await filter(arrayRole)
    } else if (role == "Sponsor") {
        array = [
            { label: "High School Student", value: "High School Student" },
            { label: "Parents", value: "Parents" }
        ]
        arrayRole = ["High School Student", "Parents"]
        await filter(arrayRole)
    } else if (role == "High School Student" && premium) {
        array = [
            { label: "College Student", value: "College Student" },
            { label: "College Graduate", value: "College Graduate" },
            { label: "Counselor", value: "Counselor" }
        ]
        arrayRole = ["College Student", "College Graduate", "Counselor"]
        await filter(arrayRole)
    }
}

// ============================================== FILTER ==============================================
function filter(value) {
    $w('#listRepeater').hide();
    $w('#loading').show();
    let filter = wixData.filter();

    filter = filter.and(wixData.filter().hasSome("role", value));

    $w('#dynamicDataset').setFilter(filter).then(() => {
        $w('#dynamicDataset').onReady(() => {
            $w('#loading').hide();
            $w('#listRepeater').show();
        })
    });
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

    if (catFilter.length > 0) filter = filter.and(wixData.filter().hasSome("role", catFilter));
    else filter = filter.and(wixData.filter().hasSome("role", arrayRole));
    if (cateState.length > 0) filter = filter.and(wixData.filter().hasSome("state", cateState));
    else filter = filter.and(wixData.filter().hasSome("role", arrayRole));
    if (cateCity.length > 0) filter = filter.and(wixData.filter().hasSome("city", cateCity));
    else filter = filter.and(wixData.filter().hasSome("role", arrayRole));

    if (catFilter.length + cateState.length + cateCity.length == 0) filter = filter.and(wixData.filter().hasSome("role", arrayRole));

    $w('#dynamicDataset').setFilter(filter).then(() => {
        $w('#dynamicDataset').onReady(async () => {
            await okRep()
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

// ============================================================================================ REP ============================================================================================
function okRep() {
    $w('#listRepeater').onItemReady(() => {
        $w('#listRepeater').forEachItem(($item, itemData) => {
            let city, state, value = false
            if ($item('#city').text !== 'Message') city = $item('#city').text + " ", value = true
            if ($item('#state').text !== 'Message') state = $item('#state').text, value = true
            if (value) $item('#cityState').text = city + state, $item('#cityState').show();

            if (itemData.role == "High School Student") $item('#text69').text = itemData.hsName
            else if (itemData.role == "College Student" || itemData.role == "College Graduate" || itemData.role == "Counselor") $item('#text69').text = itemData.highestCollegeDegree
            else $item('#text69').hide()
        })
    })
}