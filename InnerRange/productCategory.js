import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import { session } from 'wix-storage-frontend';

import { getDropdowns } from 'backend/collections.jsw'
var category = 'IP Cameras';

$w.onReady(async function () {
    session.setItem('page', wixLocationFrontend.url);
    filter();
    await dropdowns();
    init();
});

function init() {
    // Filters
    $w('#search').onInput(() => filter());
    $w('#solutions').onChange(() => filter());
    $w('#subCategory').onChange(() => filter());
    // Reset
    $w('#resetF').onClick(() => {
        $w('#solutions').value = "";
        $w('#subCategory').value = "";
        $w('#search').value = "";
        filter();
    })
}
// Get info of each dropdown
async function dropdowns() {
    let drops = await getDropdowns(category);

    if (drops.dropSolutions.length > 0 && drops.dropSolutions[0].label) {
        $w('#solutions').options = drops.dropSolutions;
        $w('#solutions').enable();
    }

    if (drops.dropSC.length > 0 && drops.dropSC[0].label) {
        $w('#subCategory').options = drops.dropSC;
        $w('#subCategory').enable();
    }
}
// Apply filters
async function filter() {
    let filter = wixData.filter();
    let sort = wixData.sort().ascending('order');
    filter = filter.and(wixData.filter().contains('category', category));
    filter = filter.not(wixData.filter().eq('ok', true));
    if ($w('#search').value !== '') filter = filter.and(((wixData.filter().contains('name', $w('#search').value)).or(wixData.filter().contains('sku', $w('#search').value)).or(wixData.filter().contains('description', $w('#search').value))));
    if ($w('#solutions').value !== '' && $w('#solutions').value !== 'RESET_ALL') filter = filter.and(wixData.filter().contains('solutions', $w('#solutions').value));
    if ($w('#subCategory').value !== '' && $w('#subCategory').value !== 'RESET_ALL') filter = filter.and(wixData.filter().contains('subCategory', $w('#subCategory').value));
    $w('#dataset1').setFilter(filter).then(() => {
        $w('#dataset1').onReady(() => {
            $w('#repProducts').expand();
        })
    });
    $w('#dataset1').setSort(sort);
}