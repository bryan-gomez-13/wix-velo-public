import { getDropdownOptions } from 'backend/collections.web.js';
import { session } from "wix-storage-frontend";
import wixData from 'wix-data';

$w.onReady(function () {
    init();
});

function init() {
    // Get Options
    getDropdownOptions('CategoryJobs').then((options) => {
        $w('#repJobOptions').data = options;
        $w('#repJobOptions').onItemReady(($item, itemData, index) => {
            $item('#btFilter').label = itemData.title;

            if (session.getItem("category")) {
                if (session.getItem("category") == itemData._id) {
                    session.clear();
                    $item('#btFilter').disable();
                    $w('#category').text = itemData.title;
                    filter(itemData._id)
                }
            } else if (index == 0) {
                $item('#btFilter').disable();
                $w('#category').text = itemData.title;
                filter(itemData._id)
            }

            $item('#btFilter').onClick(() => {
                filter(itemData._id);

                $w('#repJobOptions').forEachItem(($item2, itemData2) => {
                    if (itemData._id == itemData2._id) {
                        $item2('#btFilter').disable();
                        $w('#category').text = itemData2.title;
                    } else $item2('#btFilter').enable();
                })
            })
        })
    })

    // Job options
    $w('#repJobs').onItemReady(($item, itemData) => {
        const tags = itemData.arraystring1.map(tag => ({ label: tag, value: tag }));
        $item('#tags').options = tags;
    })
}

function filter(category) {
    let filter = wixData.filter().eq('category', category);
    $w('#dataJobs').setFilter(filter);
}