import wixData from 'wix-data';

$w.onReady(function () {
    getDrop();
});

function getDrop() {
    wixData.query('Expertise').ascending('order').find().then((results) => {
        if (results.items.length > 0) {
            let items = results.items
            $w('#rep').data = items
            $w('#rep').onItemReady(($item, itemData, index) => {
                $item('#fil').label = itemData.title;
                $item('#fil').onClick(() => {
                    filter(itemData._id)
                    $w('#rep').forEachItem(($item2, itemData2) => {
                        if (itemData2._id == itemData._id) $item2('#fil').disable()
                        else $item2('#fil').enable()
                    });
                })
            })
            $w('#rep').show();
        }
    }).catch((err) => console.log(err))
}

function filter(fil) {
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().eq("expertise", fil));
    $w('#projectsDataset').setFilter(filter);
}