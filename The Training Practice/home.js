import wixData from 'wix-data';

$w.onReady(function () {
    filter()
})

function filter() {
    let filter = wixData.filter();
    let dnow = new Date();
    filter = filter.and(filter.ge('date', dnow))
    $w('#dataset13').setFilter(filter);
}