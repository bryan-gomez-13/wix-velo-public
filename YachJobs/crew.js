import wixData from 'wix-data';

$w.onReady(function () {

    $w('#filter').onChange(() => filter())
    $w('#exp').onChange(() => filter())
    $w('#longest').onChange(() => filter())

});

function filter() {
    let filter = wixData.filter();

    if ($w('#filter').value !== "" && $w('#filter').value !== "All") filter = filter.and(wixData.filter().eq("title", $w('#filter').value));
    if ($w('#exp').value !== "" && $w('#exp').value !== "all") filter = filter.and(wixData.filter().eq("text", $w('#exp').value));
    if ($w('#longest').value !== "" && $w('#longest').value !== "all") filter = filter.and(wixData.filter().eq("longestEmployment", $w('#longest').value));

    $w('#dataset1').setFilter(filter);
}