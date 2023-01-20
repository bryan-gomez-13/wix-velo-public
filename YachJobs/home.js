import wixWindow from 'wix-window';
import wixData from 'wix-data';

$w.onReady(async function () {
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
            Jobs(itemdata.title)
            $w("#filter").forEachItem(($item2, itemData2, index2) => {
                if (index2 == index) $item2('#btFilter').disable()
                else $item2('#btFilter').enable()
            });

        })
    })

    if (wixWindow.formFactor == 'Mobile') {
        await drop()
        $w('#drop').onChange(() => Jobs($w('#drop').value))
    } else $w('#filter').expand(), $w('#drop').collapse()
});

async function drop() {
    $w('#filter').collapse()
    await wixData.query("Crew")
        .ascending('order')
        .find()
        .then((results) => {
            let array = [{ "label": "All", "value": "All" }];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i].title })
            }
            $w('#drop').options = array;
            $w('#drop').expand();
        }).catch((err) => console.log(err));
}

function Jobs(itemData) {
    let filter = wixData.filter();
    if (itemData !== "All")
        filter = filter.and((wixData.filter().contains("dropdownField", itemData)))
    $w('#dataset1').setFilter(filter);
}