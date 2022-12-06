import wixWindow from 'wix-window';
import wixData from 'wix-data';
var mobile = false

$w.onReady(function () {
    $w('#dataset1').onReady(() => {
        $w('#repJobs').onItemReady(($item, itemData) => {
            //Jobs();
            let json = {
                email: itemData.email,
                position: itemData.dropdownField
            }
            $item('#emailB').onClick(() => wixWindow.openLightbox("Send Email", json))
            let crew = ""
            if (itemData.dropdownField.includes('$')) {
                let x = itemData.dropdownField.split('$')
                crew = x[1]
            } else crew = itemData.dropdownField
            $item('#text37').text = crew
        })
    })

    $w('#filter').onItemReady(($item, itemdata, index) => {
        $item('#btFilter').onClick(() => {
            console.log(itemdata)
            Jobs(itemdata)
            $w("#filter").forEachItem(($item2, itemData2, index2) => {
                if(index2 == index) $item2('#btFilter').disable()
                else $item2('#btFilter').enable()
            });
            
        })
    })

    if(wixWindow.formFactor == 'Mobile') {
        $w('#filterB').onClick(() => {
            if(mobile == false) $w('#filterBox').expand(), mobile = true
            else $w('#filterBox').collapse(), mobile = false
        })
    }
});

function Jobs(itemData) {
    let filter = wixData.filter();
    filter = filter.and((wixData.filter().eq("dropdownField", itemData.title)).or(wixData.filter().eq("dropdownField", itemData._id+"$"+itemData.title)))
    $w('#dataset1').setFilter(filter);
}