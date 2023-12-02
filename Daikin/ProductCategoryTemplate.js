import wixData from 'wix-data';
var wifi, reverse, cooling;
$w.onReady(async function () {
    await getIcons()
    $w('#dataset1').onReady(() => {
        $w('#repeater1').onItemReady(($item, itemData) => {
            // Wifi
            if (itemData.iconWifi) $item('#vWifi').expand();
            else $item('#vWifi').collapse();
            // Reverse Cycle
            if (itemData.iconReverseCycle) $item('#veReverseCycle').expand();
            else $item('#veReverseCycle').collapse();
            // Cooling Only
            if (itemData.iconCoolingOnly) $item('#vCoolingOnly').expand();
            else $item('#vCoolingOnly').collapse();
        })
    })
});

function getIcons() {
    wixData.query('Productfeatureicons').find().then((result) => {
        let items = result.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i]._id == "7457f6be-d622-4fe9-92e1-500538d5db5a") {
                wifi = items[i].image;
                $w('#vsWifi').src = wifi;
                $w('#vWifi').src = wifi;
            }
            if (items[i]._id == "f5313ab8-759e-4e76-96cc-e0878289160f") {
                reverse = items[i].image;
                $w('#vsRever').src = reverse;
                $w('#veReverseCycle').src = reverse;
            }
            if (items[i]._id == "f766fd2d-1175-4b5e-b229-f03cef8d6d0f") {
                cooling = items[i].image;
                $w('#vsCooling').src = cooling;
                $w('#vCoolingOnly').src = cooling;
            }
        }
    }).catch((err) => console.log(err))
}