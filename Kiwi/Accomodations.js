import wixData from 'wix-data';
import { currentMember, authentication } from 'wix-members';
import { getReference } from 'backend/data.jsw'
var visible = true,
    memberId, reference = [];
$w.onReady(async function () {
    await getUser();
    repIsland();
});
// ==================================== GET USER ====================================
async function getUser() {
    await currentMember.getMember().then(async (member) => {
        memberId = member._id;
        reference = await getReference(memberId)
        //console.log("reference", reference)
    }).catch((error) => console.log(error));
}
// ==================================== REPEATER ====================================
async function repIsland() {
    await wixData.query('Locations').eq('island', "NORTH ISLAND").find().then((results) => {
        let items = results.items;
        $w('#northIsland').data = items;
        $w('#northIsland').onItemReady(($item, itemData) => {
            $item('#btNI').label = itemData.title;
            $item('#btNI').onClick(async () => {
                $w('#locations').text = itemData.title
                await filter(itemData._id);
                deIslands(itemData.title);
            })
        })
    }).catch((err) => console.log(err))

    await wixData.query('Locations').eq('island', "SOUTH ISLAND").find().then((results) => {
        let items = results.items;
        $w('#southIsland').data = items;
        $w('#southIsland').onItemReady(($item, itemData) => {
            $item('#btSI').label = itemData.title;
            $item('#btSI').onClick(async () => {
                $w('#locations').text = itemData.title
                await filter(itemData._id);
                deIslands(itemData.title);
            })
        })
    }).catch((err) => console.log(err))
}

function deIslands(title) {
    $w('#northIsland').forEachItem(($item2, itemData2) => {
        if (title == itemData2.title) $item2('#btNI').disable();
        else $item2('#btNI').enable();
    })

    $w('#southIsland').forEachItem(($item2, itemData2) => {
        if (title == itemData2.title) $item2('#btSI').disable();
        else $item2('#btSI').enable();
    })
}

function filter(filt) {
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().eq("location", filt));
    if (reference !== undefined) {
        let variable = false
        for (let i = 0; i < reference.length; i++) {
            if (reference[i]._id == filt) {
                variable = true
                break;
            }
        }
        //console.log(variable)
        if (variable) $w('#btBookNow').disable(), $w('#btReadMore').disable(), $w('#message').expand();
        else $w('#btBookNow').enable(), $w('#btReadMore').enable(), $w('#message').collapse()
    }
    $w('#dataServices').setFilter(filter);

    if (visible) {
        $w('#dataServices').onReady(() => {
            visible = false
            $w('#section3').expand();
        })
    }
}