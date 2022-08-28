import wixData from 'wix-data';

$w.onReady(function () {
    init()
});

function init() {
    $w('#search').onInput(() => filter())
}

function filter() {
    let filter = wixData.filter();
    filter = filter.or(wixData.filter().contains("title", $w('#search').value).or(wixData.filter().contains("keywords", $w('#search').value)).or(wixData.filter().contains("topics", $w('#search').value)));
    filter = filter.and(wixData.filter().eq("visible", true))
    $w('#dynamicDataset').setFilter(filter);
}