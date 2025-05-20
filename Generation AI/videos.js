import { getDropdownJobsOptions } from 'backend/collections.web.js';
import wixData from 'wix-data';
let ok = true;

$w.onReady(function () {

    getDropdownJobsOptions('Videospage', 'category').then((results) => {
        $w('#repFilter').data = results;
        $w('#repFilter').onItemReady(($item, itemData, index) => {
            if (ok && index == 0) ok = false, $item('#btFilter').disable();
            $item('#btFilter').label = itemData.value;
            $item('#btFilter').onClick(() => {
                filter(itemData.value)
                $w('#repFilter').forEachItem(($item2, itemData2) => {
                    if (itemData._id == itemData2._id) $item2('#btFilter').disable();
                    else $item2('#btFilter').enable();
                })
            })
        })
    })

});

function filter(option) {
    let filter = wixData.filter()

    if (option !== 'All Posts') filter = filter.and(wixData.filter().hasSome('category', [option]));
    $w('#dataset1').setFilter(filter);
}