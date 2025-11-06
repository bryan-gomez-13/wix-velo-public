import { getDropdownJobsOptions_Repeater_with_UniqueReference } from 'backend/collections.web.js';
import wixData from 'wix-data';

let disableOption = true;
let repInfo;

$w.onReady(function () {
    init();
});

function init() {
    getDropdownJobsOptions_Repeater_with_UniqueReference('AudiosBeyondSelf', 'SeriesBeyondSelf', 'serie').then((result) => {
        repInfo = result;
        $w('#repBeyondOptions').data = result;
        $w('#repBeyondOptions').onItemReady(($item, itemData, index) => {
            console.log(index)
            if (index == 0 && disableOption) {
                disableOption = false;
                $item('#btSerie').disable();
                filter(itemData);
            }

            $item('#btSerie').label = itemData.title;
        })
    })

    $w('#btSerie').onClick((event) => {
        // Get the data of the clicked item from the repeater
        const itemDataFilter = repInfo.find(item => item._id === event.context.itemId);

        // Apply the filter function using the selected item
        filter(itemDataFilter);

        // Loop through all items in the repeater
        $w('#repBeyondOptions').forEachItem(($item, itemData) => {
            // Disable the button for the selected item, enable others
            if (itemData._id === itemDataFilter._id) {
                $item('#btSerie').disable();
            } else {
                $item('#btSerie').enable();
            }
        });
    });
}

function filter(serie) {
    $w('#serieTitle').text = serie.serieTitle;

    $w('#repBeyondOptions').expand();
    $w('#serieTitle').expand();

    let filterInfo = wixData.filter().eq('serie', serie._id);
    $w('#dataset2').setFilter(filterInfo).then(() => {
        $w('#dataset2').onReady(() => {
            $w('#repBeyond').show();
        })
    })
}