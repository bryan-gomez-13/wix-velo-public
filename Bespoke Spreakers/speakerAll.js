import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    init();
});

function init() {
    $w('#search').onInput(() => filter())
    $w('Image').onClick((event) => {
        let $item = $w.at(event.context);
        let item = $item("#dynamicDataset").getCurrentItem();
        console.log(item['link-speakers-title']),
            wixLocation.to(item['link-speakers-title'])
    })
}

function filter() {
    let filter = wixData.filter();
    filter = filter.or(wixData.filter().contains("title", $w('#search').value).or(wixData.filter().contains("keywords", $w('#search').value)).or(wixData.filter().contains("topics", $w('#search').value)));
    filter = filter.and(wixData.filter().eq("visible", true))
    $w('#dynamicDataset').setFilter(filter);
}