import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(function () {
    $w('#search').onInput(() => filter())
    $w('#sort').onChange(() => filter())

    $w('#members').onItemReady(($item, itemData) => {
        $item('#readMore').onClick(() => {
            if (itemData.title == "Northland Marine Brokers") wixLocation.to('/northland-marine-brokers')
            else wixLocation.to('/members/' + itemData.url)
        })

        $item('#image105').onClick(() => {
            if (itemData.title == "Northland Marine Brokers") wixLocation.to('/northland-marine-brokers')
            else wixLocation.to('/members/' + itemData.url)
        })
    })
});

function filter() {
    let filter = wixData.filter();
    let sort = wixData.sort();
    //Name of the field
    if ($w('#search').value !== '') filter = filter.and(wixData.filter().contains("title", $w('#search').value));
    filter = filter.and(wixData.filter().eq("status", true));

    if ($w('#sort').value == "A-Z") sort = sort.ascending("title");
    else sort = sort.descending("title");

    $w('#dynamicDataset').setFilter(filter);
    $w("#dynamicDataset").setSort(sort);
}