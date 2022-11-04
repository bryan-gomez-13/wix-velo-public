import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    options();
    init();
});

function init() {
    $w('#category').onChange(() => filter())
    $w('#propertiesRepeater').onItemReady(($item, itemData, index) => {
        if (itemData.pdf) {
            $item('#buttonDownload').show();
        }
    })

    //Special house
    $w('#dynamicDataset').onReady(() => $w('#propertiesRepeater').onItemReady(($item, itemData) => { if (itemData._id == "66e35f62-cbae-45bf-8457-6c26fc72e808") $item('#imageX1').link = "/new-terraces" }))
}

function options() {
    wixData.query("Areas")
        .ascending('title')
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                //console.log(results.items)
                let type = [{ "label": "All", "value": "All" }];
                for (let i = 0; i < results.items.length; i++) {
                    type.push({ label: results.items[i].title, value: results.items[i]._id })
                }
                $w('#category').options = type;
            }
        })
        .catch((err) => {
            console.log(err)
        });

}

function filter() {
    let filter = wixData.filter()
    if ($w('#category').value !== 'All') filter = filter.hasSome("areas", $w('#category').value);
    $w("#dynamicDataset").setFilter(filter)
}